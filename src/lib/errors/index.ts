/**
 * ============================================
 * ERRORS — PUBLIC API
 * ============================================
 */
export { AppError } from './AppError';
export { withErrorHandler } from './errorHandler';
export { ERROR_CODES, type ErrorCode } from './errorCodes';
export { CryptoApiError, OrderError, WebSocketError, AuthError } from './cryptoErrors';
