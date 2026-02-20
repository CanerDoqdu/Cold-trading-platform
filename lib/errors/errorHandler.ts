/**
 * ============================================
 * CENTRALIZED ERROR HANDLER + API ROUTE WRAPPER
 * ============================================
 * Wraps every API route handler so you NEVER need try/catch in routes.
 *
 * Before:
 *   export async function GET(req) {
 *     try { ... } catch (e) { return NextResponse.json({error: e.message}, {status: 500}); }
 *   }
 *
 * After:
 *   export const GET = withErrorHandler(async (req) => {
 *     // just throw — handler catches, logs, responds
 *     const data = await fetchSomething();
 *     return NextResponse.json(data);
 *   });
 *
 * Features:
 *  - Catches all sync/async errors
 *  - Classifies unknown errors into AppError
 *  - Logs structured error context
 *  - Returns consistent JSON error shape
 *  - Injects correlation ID into error response
 *  - Hides internal details in production
 *
 * Same pattern: Express error middleware, NestJS exception filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError, SerializedError } from './AppError';
import { logger } from '../logger';

type RouteHandler = (
  req: NextRequest,
  context?: any,
) => Promise<NextResponse> | NextResponse;

/**
 * Consistent error response shape sent to clients.
 */
interface ErrorResponse {
  error: SerializedError;
  success: false;
}

/**
 * Wrap an API route handler with centralized error handling.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    // Generate or extract correlation ID for this request
    const correlationId =
      req.headers.get('x-correlation-id') ||
      req.headers.get('x-request-id') ||
      generateCorrelationId();

    try {
      const response = await handler(req, context);

      // Attach correlation ID to all responses
      response.headers.set('X-Correlation-ID', correlationId);
      return response;
    } catch (err: unknown) {
      const appError = AppError.from(err);
      appError.correlationId = correlationId;

      // ─── Logging by severity ───
      const logContext = {
        correlationId,
        method: req.method,
        path: req.nextUrl.pathname,
        errorCode: appError.code,
        category: appError.category,
        httpStatus: appError.httpStatus,
        details: appError.details,
        // Include stack only in non-production
        ...(process.env.NODE_ENV !== 'production' && {
          stack: appError.stack,
        }),
      };

      if (appError.category === 'INTERNAL') {
        logger.error(appError.message, logContext);
      } else if (appError.category === 'EXTERNAL' || appError.category === 'TIMEOUT') {
        logger.warn(appError.message, logContext);
      } else {
        logger.info(appError.message, logContext);
      }

      // ─── Build response ───
      const body: ErrorResponse = {
        success: false,
        error: appError.toJSON(),
      };

      // In production, strip internal details from non-operational errors
      if (process.env.NODE_ENV === 'production' && !appError.isOperational) {
        body.error.message = 'Internal server error';
        delete body.error.details;
      }

      const response = NextResponse.json(body, {
        status: appError.httpStatus,
      });
      response.headers.set('X-Correlation-ID', correlationId);

      return response;
    }
  };
}

/**
 * Generate a unique correlation ID.
 * Format: timestamp-random (e.g. "1708456789123-a3f9b2c1")
 * Lightweight, no external dependency.
 */
function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}
