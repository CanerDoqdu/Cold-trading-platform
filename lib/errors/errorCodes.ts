/**
 * ============================================
 * ERROR CODES & CLASSIFICATION
 * ============================================
 * Every error gets a unique code and a category.
 * This enables:
 *  - Filtering dashboards by error type
 *  - Different retry strategies per category
 *  - Frontend-friendly error messages
 *  - Log aggregation (group by code)
 *
 * Categories:
 *  VALIDATION  — bad input from client
 *  AUTH        — authentication / authorization failures
 *  NOT_FOUND   — resource doesn't exist
 *  CONFLICT    — duplicate / state conflict
 *  EXTERNAL    — 3rd party API failure (CoinGecko, OpenSea, etc.)
 *  INTERNAL    — unexpected server error
 *  RATE_LIMIT  — too many requests
 *  TIMEOUT     — operation took too long
 */

export type ErrorCategory =
  | 'VALIDATION'
  | 'AUTH'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'EXTERNAL'
  | 'INTERNAL'
  | 'RATE_LIMIT'
  | 'TIMEOUT';

export interface ErrorCodeDef {
  code: string;
  category: ErrorCategory;
  httpStatus: number;
  defaultMessage: string;
}

// ─── Error Code Registry ───
export const ERROR_CODES = {
  // ── Validation ──
  VALIDATION_FAILED:      { code: 'VALIDATION_FAILED',      category: 'VALIDATION',  httpStatus: 400, defaultMessage: 'Validation failed' },
  INVALID_INPUT:          { code: 'INVALID_INPUT',           category: 'VALIDATION',  httpStatus: 400, defaultMessage: 'Invalid input provided' },
  MISSING_FIELD:          { code: 'MISSING_FIELD',           category: 'VALIDATION',  httpStatus: 400, defaultMessage: 'Required field is missing' },
  INVALID_FORMAT:         { code: 'INVALID_FORMAT',          category: 'VALIDATION',  httpStatus: 400, defaultMessage: 'Invalid data format' },

  // ── Auth ──
  UNAUTHORIZED:           { code: 'UNAUTHORIZED',            category: 'AUTH',        httpStatus: 401, defaultMessage: 'Authentication required' },
  FORBIDDEN:              { code: 'FORBIDDEN',               category: 'AUTH',        httpStatus: 403, defaultMessage: 'Access denied' },
  TOKEN_EXPIRED:          { code: 'TOKEN_EXPIRED',           category: 'AUTH',        httpStatus: 401, defaultMessage: 'Token has expired' },
  TOKEN_INVALID:          { code: 'TOKEN_INVALID',           category: 'AUTH',        httpStatus: 401, defaultMessage: 'Invalid token' },
  INVALID_CREDENTIALS:    { code: 'INVALID_CREDENTIALS',     category: 'AUTH',        httpStatus: 401, defaultMessage: 'Invalid email or password' },

  // ── Not Found ──
  NOT_FOUND:              { code: 'NOT_FOUND',               category: 'NOT_FOUND',   httpStatus: 404, defaultMessage: 'Resource not found' },
  USER_NOT_FOUND:         { code: 'USER_NOT_FOUND',          category: 'NOT_FOUND',   httpStatus: 404, defaultMessage: 'User not found' },
  COIN_NOT_FOUND:         { code: 'COIN_NOT_FOUND',          category: 'NOT_FOUND',   httpStatus: 404, defaultMessage: 'Coin not found' },

  // ── Conflict ──
  DUPLICATE_ENTRY:        { code: 'DUPLICATE_ENTRY',         category: 'CONFLICT',    httpStatus: 409, defaultMessage: 'Resource already exists' },
  EMAIL_IN_USE:           { code: 'EMAIL_IN_USE',            category: 'CONFLICT',    httpStatus: 409, defaultMessage: 'Email is already in use' },

  // ── External ──
  EXTERNAL_API_ERROR:     { code: 'EXTERNAL_API_ERROR',      category: 'EXTERNAL',    httpStatus: 502, defaultMessage: 'External API error' },
  COINGECKO_ERROR:        { code: 'COINGECKO_ERROR',         category: 'EXTERNAL',    httpStatus: 502, defaultMessage: 'CoinGecko API error' },
  OPENSEA_ERROR:          { code: 'OPENSEA_ERROR',           category: 'EXTERNAL',    httpStatus: 502, defaultMessage: 'OpenSea API error' },
  EXTERNAL_TIMEOUT:       { code: 'EXTERNAL_TIMEOUT',        category: 'TIMEOUT',     httpStatus: 504, defaultMessage: 'External API timeout' },

  // ── Rate Limit ──
  RATE_LIMITED:           { code: 'RATE_LIMITED',             category: 'RATE_LIMIT',  httpStatus: 429, defaultMessage: 'Too many requests' },

  // ── Internal ──
  INTERNAL_ERROR:         { code: 'INTERNAL_ERROR',          category: 'INTERNAL',    httpStatus: 500, defaultMessage: 'Internal server error' },
  DB_ERROR:               { code: 'DB_ERROR',                category: 'INTERNAL',    httpStatus: 500, defaultMessage: 'Database error' },
  CONFIG_ERROR:           { code: 'CONFIG_ERROR',            category: 'INTERNAL',    httpStatus: 500, defaultMessage: 'Configuration error' },

  // ── Timeout ──
  REQUEST_TIMEOUT:        { code: 'REQUEST_TIMEOUT',         category: 'TIMEOUT',     httpStatus: 408, defaultMessage: 'Request timed out' },
} as const satisfies Record<string, ErrorCodeDef>;

export type ErrorCode = keyof typeof ERROR_CODES;
