/**
 * JWT token refresh logic (server-side endpoint).
 *
 * Client sends refresh cookie → server verifies → issues new access token.
 * The safeFetch wrapper calls this automatically on 401.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SECRET || 'fallback');
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET || process.env.SECRET || 'fallback-refresh');

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh-token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);

    // Issue new short-lived access token
    const accessToken = await new SignJWT({ _id: payload._id, userId: payload._id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .setIssuedAt()
      .sign(ACCESS_SECRET);

    // Rotate refresh token
    const newRefresh = await new SignJWT({ _id: payload._id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(REFRESH_SECRET);

    const response = NextResponse.json({ ok: true });

    response.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refresh-token', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
