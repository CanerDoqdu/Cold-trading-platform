/**
 * ============================================
 * SECURITY — PUBLIC API
 * ============================================
 * Single import for all security utilities:
 *
 *   import { validate, schemas, sanitizeUser, applySecurityHeaders } from '@/lib/security';
 */

// Validation
export { validate, schemas } from './validation';

// Sanitization
export { sanitizeOutput, sanitizeUser, escapeHtml, stripHtml } from './sanitize';

// CSRF
export { generateCsrfToken, validateCsrf, attachCsrfToken } from './csrf';

// Security Headers
export { applySecurityHeaders } from './headers';
export type { SecurityHeadersConfig } from './headers';

// Token Service
export {
  createAccessToken,
  createRefreshToken,
  createTokenPair,
  verifyToken,
  setTokenCookies,
  clearTokenCookies,
  rotateTokens,
} from './tokenService';
export type { TokenPayload, TokenPair } from './tokenService';
