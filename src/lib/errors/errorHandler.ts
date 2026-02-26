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
import { AppError } from './AppError';
import { logger } from '../logger';

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

      // Operational errors (expected) → warn; programming errors → error
      if (appError.isOperational) {
        log.warn('Operational error', {
          code: appError.code,
          category: appError.category,
          message: appError.message,
          durationMs,
        });
      } else {
        log.error('Unexpected error', {
          code: appError.code,
          category: appError.category,
          message: appError.message,
          stack: appError.stack,
          durationMs,
        });
      }

      const isDev = process.env.NODE_ENV === 'development';
      const body = appError.toJSON(isDev);

      return NextResponse.json(body, {
        status: appError.httpStatus,
        headers: { 'x-correlation-id': correlationId },
      });
    }
  };
}
