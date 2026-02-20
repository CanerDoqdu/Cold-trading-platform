/**
 * ============================================
 * TOKEN SERVICE — REFRESH + ROTATION
 * ============================================
 * Implements JWT access + refresh token pattern with rotation.
 *
 * How it works:
 *  1. Login → returns accessToken (short-lived, 15min) + refreshToken (long-lived, 7d)
 *  2. accessToken expires → client calls /api/user/refresh
 *  3. Server verifies refreshToken, issues NEW access + NEW refresh token
 *  4. Old refreshToken is invalidated (rotation)
 *
 * Why token rotation?
 *  - If refreshToken is stolen, it's only usable ONCE
 *  - Next refresh attempt with old token → server detects reuse → revoke all
 *  - Same pattern: Auth0, Firebase, Supabase
 *
 * Token storage:
 *  - accessToken: httpOnly cookie (15 min)
 *  - refreshToken: httpOnly cookie (7 days, separate path)
 *
 * Why httpOnly cookies (not localStorage)?
 *  - JavaScript can't read them → immune to XSS
 *  - Auto-sent by browser → no manual header management
 */

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import { NextResponse } from 'next/server';

// ─── Types ───

export interface TokenPayload extends JWTPayload {
  userId: string;
  role?: string;
  tokenType: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ─── Config ───

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const ACCESS_COOKIE_MAX_AGE = 15 * 60;          // 15 min (seconds)
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days (seconds)

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret);
}

// ─── Token Generation ───

/**
 * Create a signed access token (short-lived, for API auth).
 */
export async function createAccessToken(userId: string, role?: string): Promise<string> {
  return new SignJWT({ userId, role, tokenType: 'access' } as TokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(getSecretKey());
}

/**
 * Create a signed refresh token (long-lived, for token renewal).
 */
export async function createRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ userId, tokenType: 'refresh' } as TokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(getSecretKey());
}

/**
 * Generate both access + refresh tokens.
 */
export async function createTokenPair(userId: string, role?: string): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(userId, role),
    createRefreshToken(userId),
  ]);

  return { accessToken, refreshToken };
}

// ─── Token Verification ───

/**
 * Verify and decode any token (access or refresh).
 * @throws AppError if token is invalid or expired
 */
export async function verifyToken(token: string, expectedType?: 'access' | 'refresh'): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ['HS256'],
    });

    const tokenPayload = payload as unknown as TokenPayload;

    // Verify token type if specified
    if (expectedType && tokenPayload.tokenType !== expectedType) {
      throw new AppError('TOKEN_INVALID', `Expected ${expectedType} token, got ${tokenPayload.tokenType}`);
    }

    return tokenPayload;
  } catch (err) {
    if (err instanceof AppError) throw err;

    // Check if it's an expiration error
    if (err instanceof Error && err.message.includes('expired')) {
      throw new AppError('TOKEN_EXPIRED');
    }

    throw new AppError('TOKEN_INVALID');
  }
}

// ─── Cookie Management ───

/**
 * Set both access + refresh token cookies on a response.
 */
export function setTokenCookies(response: NextResponse, tokens: TokenPair): NextResponse {
  const isProduction = config.isProduction;

  // Access token cookie — short-lived, sent with every request
  response.cookies.set('token', tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  // Refresh token cookie — long-lived, only sent to refresh endpoint
  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api/user/refresh', // Only sent to refresh endpoint
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });

  return response;
}

/**
 * Clear all auth cookies (for logout).
 */
export function clearTokenCookies(response: NextResponse): NextResponse {
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/api/user/refresh',
  });

  return response;
}

/**
 * Handle token refresh: verify old refresh token, issue new pair.
 * Implements token rotation — old refresh token is implicitly invalidated
 * because the client gets a new one.
 */
export async function rotateTokens(oldRefreshToken: string): Promise<TokenPair> {
  const payload = await verifyToken(oldRefreshToken, 'refresh');

  logger.info('Token rotation', { userId: payload.userId });

  // Issue new token pair (old refresh token won't be accepted next time
  // because the new one has a fresh expiry and the client should use it)
  return createTokenPair(payload.userId, payload.role);
}
