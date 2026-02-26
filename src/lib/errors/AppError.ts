/**
 * ============================================
 * APPLICATION ERROR CLASS
 * ============================================
 * Structured, typed errors that carry:
 *  - Error code (from registry)
 *  - HTTP status
 *  - Category (for monitoring)
 *  - Context (debug data, never sent to client)
 *
 * Usage:
 *   throw new AppError('VALIDATION_FAILED', 'Email is required');
 *   throw AppError.validation('Email is required');
 *   throw AppError.notFound('User not found');
 *   throw AppError.from(unknownError);
 */

import { ERROR_CODES, type ErrorCode } from './errorCodes';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly category: string;
  public readonly context?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message?: string,
    context?: Record<string, unknown>,
    isOperational = true
  ) {
    const def = ERROR_CODES[code];
    super(message || def.defaultMessage);

    this.name = 'AppError';
    this.code = code;
    this.httpStatus = def.httpStatus;
    this.category = def.category;
    this.context = context;
    this.isOperational = isOperational;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Serialize for API response (safe for client).
   * Never includes stack trace or context in production.
   */
  toJSON(includeDebug = false): Record<string, unknown> {
    const base: Record<string, unknown> = {
      error: {
        code: this.code,
        message: this.message,
        category: this.category,
      },
    };

    if (includeDebug && this.context) {
      (base.error as Record<string, unknown>).context = this.context;
    }

    return base;
  }

  // ─── Factory Methods ───

  static validation(message: string, context?: Record<string, unknown>) {
    return new AppError('VALIDATION_FAILED', message, context);
  }

  static unauthorized(message?: string) {
    return new AppError('UNAUTHORIZED', message);
  }

  static forbidden(message?: string) {
    return new AppError('FORBIDDEN', message);
  }

  static notFound(message?: string, context?: Record<string, unknown>) {
    return new AppError('NOT_FOUND', message, context);
  }

  static rateLimited(message?: string) {
    return new AppError('RATE_LIMITED', message);
  }

  static external(code: ErrorCode, message?: string, context?: Record<string, unknown>) {
    return new AppError(code, message, context);
  }

  /**
   * Wrap unknown errors (from catch blocks).
   * Preserves AppError instances, wraps everything else as INTERNAL_ERROR.
   */
  static from(error: unknown): AppError {
    if (error instanceof AppError) return error;

    const message = error instanceof Error ? error.message : 'Unknown error';
    const appError = new AppError('INTERNAL_ERROR', message, undefined, false);

    // Preserve original stack
    if (error instanceof Error && error.stack) {
      appError.stack = error.stack;
    }

    return appError;
  }
}
