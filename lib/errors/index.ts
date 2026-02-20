/**
 * ============================================
 * ERRORS — PUBLIC API
 * ============================================
 * Single import for all error utilities:
 *
 *   import { AppError, withErrorHandler, ERROR_CODES } from '@/lib/errors';
 */

export { AppError } from './AppError';
export type { SerializedError } from './AppError';
export { ERROR_CODES } from './errorCodes';
export type { ErrorCode, ErrorCategory, ErrorCodeDef } from './errorCodes';
export { withErrorHandler } from './errorHandler';
