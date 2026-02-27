/**
 * ============================================
 * API ROUTE ERROR HANDLER
 * ============================================
 * Higher-order wrapper for Next.js App Router handlers.
 * Catches errors, logs them, and returns structured JSON responses.
 *
 * Usage:
 *   export const GET = withErrorHandler(async (req) => {
 *     // ... your handler logic
 *     return NextResponse.json(data);
 *   });
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { AppError } from './AppError';
import { logger } from '../logger';
import type { OrderError, CryptoApiError, WebSocketError, AuthError } from './cryptoErrors';

type RouteHandler = (
  req: NextRequest,
  context?: unknown
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps an API route handler with:
 *  - Correlation ID generation
 *  - Structured error catching + logging
 *  - Safe JSON error responses
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    const correlationId = crypto.randomUUID();
    const start = Date.now();

    const log = logger.child({ correlationId, path: req.nextUrl.pathname, method: req.method });

    try {
      log.debug('Request received');

      const response = await handler(req, context);

      log.debug('Request completed', { status: response.status, durationMs: Date.now() - start });

      // Attach correlation ID to response headers
      response.headers.set('x-correlation-id', correlationId);
      return response;
    } catch (error: unknown) {
      const appError = AppError.from(error);
      const durationMs = Date.now() - start;

      // Build Sentry tags from crypto-specific error types
      const sentryTags: Record<string, string> = {
        errorCode: appError.code,
        errorCategory: appError.category,
      };

      if (appError.name === 'OrderError') {
        const oe = appError as unknown as OrderError;
        sentryTags.coinSymbol = oe.coinSymbol;
        sentryTags.orderSide = oe.orderSide;
      } else if (appError.name === 'CryptoApiError') {
        const ce = appError as unknown as CryptoApiError;
        sentryTags.provider = ce.provider;
      } else if (appError.name === 'WebSocketError') {
        const we = appError as unknown as WebSocketError;
        if (we.channel) sentryTags.wsChannel = we.channel;
      } else if (appError.name === 'AuthError') {
        const ae = appError as unknown as AuthError;
        sentryTags.duringTrade = String(ae.duringTrade);
      }

      // Operational errors (expected) → warn; programming errors → error
      if (appError.isOperational) {
        log.warn('Operational error', {
          code: appError.code,
          category: appError.category,
          message: appError.message,
          durationMs,
          ...appError.context,
        });
      } else {
        log.error('Unexpected error', {
          code: appError.code,
          category: appError.category,
          message: appError.message,
          stack: appError.stack,
          durationMs,
          ...appError.context,
        });
      }

      // Send to Sentry with structured tags
      Sentry.withScope((scope) => {
        scope.setTags(sentryTags);
        scope.setExtra('correlationId', correlationId);
        scope.setExtra('path', req.nextUrl.pathname);
        scope.setExtra('method', req.method);
        scope.setExtra('durationMs', durationMs);

        if (appError.context) {
          scope.setExtra('errorContext', appError.context);
        }

        // Set severity based on error category
        if (appError.category === 'ORDER') {
          scope.setLevel('fatal');
        } else if (!appError.isOperational) {
          scope.setLevel('error');
        } else {
          scope.setLevel('warning');
        }

        Sentry.captureException(error);
      });

      const isDev = process.env.NODE_ENV === 'development';
      const body = appError.toJSON(isDev);

      return NextResponse.json(body, {
        status: appError.httpStatus,
        headers: { 'x-correlation-id': correlationId },
      });
    }
  };
}
