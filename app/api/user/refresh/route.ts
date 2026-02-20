/**
 * POST /api/user/refresh
 * 
 * Token rotation endpoint.
 * Client sends refresh token (in httpOnly cookie),
 * gets back new access + refresh tokens.
 *
 * Flow:
 *  1. Read refreshToken from cookie
 *  2. Verify it's valid and not expired
 *  3. Issue new token pair (rotation)
 *  4. Set new cookies
 *
 * Security:
 *  - Refresh cookie is scoped to this path only
 *  - Token rotation: old refresh token implicitly expires
 *  - If stolen token is reused after rotation → it's expired → attacker blocked
 */

import { NextResponse } from 'next/server';
import { withErrorHandler, AppError } from '@/lib/errors';
import { rotateTokens, setTokenCookies } from '@/lib/security';

export const POST = withErrorHandler(async (req) => {
  const refreshToken = req.cookies.get('refreshToken')?.value;

  if (!refreshToken) {
    throw new AppError('UNAUTHORIZED', 'No refresh token provided');
  }

  // Verify old token + issue new pair
  const newTokens = await rotateTokens(refreshToken);

  // Set new cookies
  const response = NextResponse.json({ success: true });
  setTokenCookies(response, newTokens);

  return response;
});
