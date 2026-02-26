/**
 * ============================================
 * ERROR CODES REGISTRY
 * ============================================
 * Every error the app can throw, catalogued.
 *
 * Why?
 *  - Consistent error responses across all routes
 *  - Frontend can switch on error codes
 *  - Monitoring can group by category
 *  - Same pattern: Stripe error codes, AWS error codes
 */

export interface ErrorCodeDef {
  code: string;
  category: 'VALIDATION' | 'AUTH' | 'NOT_FOUND' | 'EXTERNAL' | 'INTERNAL' | 'RATE_LIMIT';
  httpStatus: number;
  defaultMessage: string;
}

export const ERROR_CODES = {
  // ── Validation ──
  VALIDATION_FAILED: {
    code: 'VALIDATION_FAILED',
    category: 'VALIDATION',
    httpStatus: 400,
    defaultMessage: 'Request validation failed',
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    category: 'VALIDATION',
    httpStatus: 400,
    defaultMessage: 'Invalid input provided',
  },

  // ── Auth ──
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    category: 'AUTH',
    httpStatus: 401,
    defaultMessage: 'Authentication required',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    category: 'AUTH',
    httpStatus: 403,
    defaultMessage: 'Access denied',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    category: 'AUTH',
    httpStatus: 401,
    defaultMessage: 'Token has expired',
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    category: 'AUTH',
    httpStatus: 401,
    defaultMessage: 'Invalid token',
  },

  // ── Not Found ──
  NOT_FOUND: {
    code: 'NOT_FOUND',
    category: 'NOT_FOUND',
    httpStatus: 404,
    defaultMessage: 'Resource not found',
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    category: 'NOT_FOUND',
    httpStatus: 404,
    defaultMessage: 'User not found',
  },

  // ── Rate Limit ──
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    category: 'RATE_LIMIT',
    httpStatus: 429,
    defaultMessage: 'Too many requests',
  },

  // ── External Service ──
  COINGECKO_ERROR: {
    code: 'COINGECKO_ERROR',
    category: 'EXTERNAL',
    httpStatus: 502,
    defaultMessage: 'CoinGecko API error',
  },
  OPENSEA_ERROR: {
    code: 'OPENSEA_ERROR',
    category: 'EXTERNAL',
    httpStatus: 502,
    defaultMessage: 'OpenSea API error',
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    category: 'EXTERNAL',
    httpStatus: 502,
    defaultMessage: 'External service error',
  },

  // ── Internal ──
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    category: 'INTERNAL',
    httpStatus: 500,
    defaultMessage: 'Internal server error',
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    category: 'INTERNAL',
    httpStatus: 500,
    defaultMessage: 'Database operation failed',
  },
  CONFIG_ERROR: {
    code: 'CONFIG_ERROR',
    category: 'INTERNAL',
    httpStatus: 500,
    defaultMessage: 'Configuration error',
  },
} as const satisfies Record<string, ErrorCodeDef>;

export type ErrorCode = keyof typeof ERROR_CODES;
