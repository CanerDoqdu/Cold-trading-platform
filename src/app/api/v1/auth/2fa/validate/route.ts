import { NextRequest, NextResponse } from 'next/server';
import { verifySync } from 'otplib';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { totpVerifySchema } from '@/lib/schemas';
import { timingSafeCompare } from '@/lib/auth/timingSafe';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { audit, extractRequestMeta } from '@/lib/auditLog';

// ── POST /api/v1/auth/2fa/validate ─────
// Called at login when 2FA is enabled (after password verified)
export async function POST(request: NextRequest) {
  const body = totpVerifySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: body.error.flatten() },
      { status: 400 },
    );
  }

  // tempToken should be passed from the login flow
  const tempToken = request.headers.get('x-temp-token');
  if (!tempToken) {
    return NextResponse.json({ error: 'Missing temp token' }, { status: 400 });
  }

  let decoded: { _id: string };
  try {
    decoded = jwt.verify(tempToken, process.env.SECRET!) as { _id: string };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired temp token' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(decoded._id);
  if (!user || !user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: '2FA not configured' }, { status: 400 });
  }

  // Try TOTP code first
  let codeValid = verifySync({ token: body.data.code, secret: user.totpSecret }).valid;

  // If TOTP fails, try backup codes
  if (!codeValid && user.backupCodes?.length) {
    for (let i = 0; i < user.backupCodes.length; i++) {
      const match = await bcrypt.compare(body.data.code, user.backupCodes[i]);
      if (match) {
        codeValid = true;
        // Consume the backup code (one-time use)
        user.backupCodes.splice(i, 1);
        await user.save();
        break;
      }
    }
  }

  if (!codeValid) {
    const { ip, userAgent } = extractRequestMeta(request);
    await audit({ userId: decoded._id, action: 'LOGIN_FAILURE', ip, userAgent, metadata: { reason: '2fa_invalid' } });
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  }

  // Issue full session token
  const token = jwt.sign({ _id: user._id }, process.env.SECRET!, { expiresIn: '3d' });
  const response = NextResponse.json({
    version: 'v1',
    ok: true,
    data: { _id: user._id, name: user.name, email: user.email },
  });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3 * 24 * 60 * 60,
    sameSite: 'lax',
    path: '/',
  });

  const { ip, userAgent } = extractRequestMeta(request);
  await audit({ userId: user._id.toString(), action: 'LOGIN_SUCCESS', ip, userAgent, metadata: { via: '2fa' } });

  return response;
}
