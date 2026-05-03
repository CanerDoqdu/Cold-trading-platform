import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { forgotPasswordSchema } from '@/lib/schemas';
import { generateSecureToken } from '@/lib/auth/timingSafe';
import { audit, extractRequestMeta } from '@/lib/auditLog';

// ── POST /api/v1/auth/reset-password/request ──
// Request a password reset link by email
export async function POST(request: NextRequest) {
  const body = forgotPasswordSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: body.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const { email } = body.data;
  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  const genericResponse = NextResponse.json({
    version: 'v1',
    ok: true,
    data: { message: 'If your email is registered, you will receive a reset link.' },
  });

  if (!user) return genericResponse;

  // Generate token: store hashed version in DB, send raw in email
  const rawToken = generateSecureToken(32);
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  // TODO: PR12 — send actual email with:
  // https://${BASE_URL}/reset-password?token=${rawToken}
  // For now, log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);
  }

  const { ip, userAgent } = extractRequestMeta(request);
  await audit({ userId: user._id.toString(), action: 'PASSWORD_RESET_REQUESTED', ip, userAgent });

  return genericResponse;
}
