import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { verifyEmailSchema } from '@/lib/schemas';
import { audit, extractRequestMeta } from '@/lib/auditLog';

// ── POST /api/v1/auth/verify-email ─────
// Verify email with signed token
export async function POST(request: NextRequest) {
  const body = verifyEmailSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: body.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const hashedToken = createHash('sha256').update(body.data.token).digest('hex');

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired verification token' } },
      { status: 400 },
    );
  }

  user.emailVerified = true;
  user.emailVerifyToken = null;
  user.emailVerifyExpires = null;
  await user.save();

  const { ip, userAgent } = extractRequestMeta(request);
  await audit({ userId: user._id.toString(), action: 'EMAIL_VERIFIED', ip, userAgent });

  return NextResponse.json({
    version: 'v1',
    ok: true,
    data: { message: 'Email verified successfully' },
  });
}
