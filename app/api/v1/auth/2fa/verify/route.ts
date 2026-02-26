import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { verifySync } from 'otplib';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { audit, extractRequestMeta } from '@/lib/auditLog';
import { totpVerifySchema } from '@/lib/schemas';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SECRET || 'fallback');

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.userId || payload._id) as string;
  } catch {
    return null;
  }
}

// ── POST /api/v1/auth/2fa/verify ───────
// Verify TOTP code and enable 2FA on account
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = totpVerifySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: body.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const user = await User.findById(userId);
  if (!user || !user.totpSecret) {
    return NextResponse.json({ error: 'Run 2FA setup first' }, { status: 400 });
  }

  const result = verifySync({ token: body.data.code, secret: user.totpSecret });
  if (!result.valid) {
    return NextResponse.json({ error: 'Invalid TOTP code' }, { status: 400 });
  }

  user.totpEnabled = true;
  await user.save();

  const { ip, userAgent } = extractRequestMeta(request);
  await audit({ userId, action: '2FA_ENABLED', ip, userAgent });

  return NextResponse.json({ version: 'v1', ok: true, data: { message: '2FA is now enabled' } });
}
