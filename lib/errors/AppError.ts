/**
 * ============================================
 * AppError — TYPED, CLASSIFIED ERROR CLASS
 * ============================================
 * Usage:
 *   throw new AppError('UNAUTHORIZED');
 *   throw new AppError('VALIDATION_FAILED', 'Email is required', { field: 'email' });
 *   throw AppError.validation('Email is required');
 *   throw AppError.notFound('Coin');
 *
 * Every error carries:
 *  - code (e.g. 'VALIDATION_FAILED')
 *  - category (e.g. 'VALIDATION')
 *  - httpStatus (e.g. 400)
 *  - message (human-readable)
 *  - details (optional extra context)
 *  - timestamp
 *  - correlationId (injected by logger)
 *
 * Same approach: Stripe API errors, GitHub API errors
 */

import { ERROR_CODES, ErrorCode, ErrorCategory } from './errorCodes';

export interface SerializedError {
  code: string;
  category: ErrorCategory;
  message: string;
  httpStatus: number;
  details?: Record<string, any>;
  timestamp: string;
  correlationId?: string;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly httpStatus: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;
  public correlationId?: string;
  public readonly isOperational: boolean;

  constructor(
    errorCode: ErrorCode,
    message?: string,
    details?: Record<string, any>,
  ) {
    const def = ERROR_CODES[errorCode];
    super(message || def.defaultMessage);

    this.code = def.code;
    this.category = def.category;
    this.httpStatus = def.httpStatus;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // distinguishes expected vs unexpected errors

    // Maintain proper stack trace
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Serialize to JSON for API responses.
   * NEVER exposes stack traces to clients.
   */
  toJSON(): SerializedError {
    return {
      code: this.code,
      category: this.category,
      message: this.message,
      httpStatus: this.httpStatus,
      ...(this.details && { details: this.details }),
      timestamp: this.timestamp,
      ...(this.correlationId && { correlationId: this.correlationId }),
    };
  }

  // ─── Factory Methods (convenience) ───

  static validation(message: string, details?: Record<string, any>): AppError {
    return new AppError('VALIDATION_FAILED', message, details);
  }

  static unauthorized(message?: string): AppError {
    return new AppError('UNAUTHORIZED', message);
  }

  static forbidden(message?: string): AppError {
    return new AppError('FORBIDDEN', message);
  }

  static notFound(resource: string): AppError {
    return new AppError('NOT_FOUND', `${resource} not found`);
  }

  static conflict(message: string): AppError {
    return new AppError('DUPLICATE_ENTRY', message);
  }

  static external(source: string, message?: string, details?: Record<string, any>): AppError {
    return new AppError('EXTERNAL_API_ERROR', message || `${source} API error`, {
      source,
      ...details,
    });
  }

  static timeout(operation: string): AppError {
    return new AppError('REQUEST_TIMEOUT', `${operation} timed out`);
  }

  static internal(message?: string, details?: Record<string, any>): AppError {
    return new AppError('INTERNAL_ERROR', message, details);
  }

  /**
   * Wrap an unknown caught value into AppError.
   * Preserves AppError instances, wraps everything else.
   */
  static from(err: unknown): AppError {
    if (err instanceof AppError) return err;

    if (err instanceof Error) {
      const wrapped = new AppError('INTERNAL_ERROR', err.message);
      wrapped.stack = err.stack;
      return wrapped;
    }

    return new AppError('INTERNAL_ERROR', String(err));
  }
}
