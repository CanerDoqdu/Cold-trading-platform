/**
 * ============================================
 * CSRF PROTECTION
 * ============================================
 * Double Submit Cookie pattern — stateless CSRF protection.
 *
 * How it works:
 *  1. Server generates a random CSRF token
 *  2. Token is set in both: a cookie AND returned in response
 *  3. Client sends token back in X-CSRF-Token header
 *  4. Server compares cookie token vs header token
 *  5. Attacker can't read the cookie from another domain → blocked
 *
 * Why Double Submit Cookie (not session-based)?
 *  - Works with stateless JWTs (no server session needed)
 *  - Scales horizontally (no shared session store)
 *  - Same pattern: Next.js, Django, Rails
 *
 * Protected methods: POST, PUT, PATCH, DELETE (state-changing)
 * Skipped: GET, HEAD, OPTIONS (read-only, safe)
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = '__csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Generate a cryptographically secure CSRF token.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token on a request.
 * Compares the cookie value against the header value.
 *
 * @throws AppError('FORBIDDEN') if tokens don't match
 */
export function validateCsrf(req: NextRequest): void {
  // Skip safe (read-only) methods
  if (SAFE_METHODS.has(req.method)) return;

  const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = req.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    logger.warn('CSRF token missing', {
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
      method: req.method,
      path: req.nextUrl.pathname,
    });
    throw new AppError('FORBIDDEN', 'CSRF token missing');
  }

  // Timing-safe comparison to prevent timing attacks
  if (!timingSafeEqual(cookieToken, headerToken)) {
    logger.warn('CSRF token mismatch', {
      method: req.method,
      path: req.nextUrl.pathname,
    });
    throw new AppError('FORBIDDEN', 'CSRF token invalid');
  }
}

/**
 * Attach a fresh CSRF token cookie to a response.
 * Call this on login / page load so the client has a token to send.
 */
export function attachCsrfToken(response: NextResponse, token?: string): NextResponse {
  const csrfToken = token || generateCsrfToken();

  response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false,  // Client JS must be able to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Also set as response header so SPA can grab it easily
  response.headers.set(CSRF_HEADER_NAME, csrfToken);

  return response;
}

/**
 * Timing-safe string comparison.
 * Prevents attackers from using response time to guess token values.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(
      new Uint8Array(Buffer.from(a, 'utf-8')),
      new Uint8Array(Buffer.from(b, 'utf-8')),
    );
  } catch {
    return false;
  }
}
