import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { resetPasswordSchema } from '@/lib/schemas';
import { audit, extractRequestMeta } from '@/lib/auditLog';

// ── POST /api/v1/auth/reset-password/confirm ──
// Verify token + set new password
export async function POST(request: NextRequest) {
  const body = resetPasswordSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: body.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const { token, newPassword } = body.data;
  const hashedToken = createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' } },
      { status: 400 },
    );
  }

  // Update password (bcrypt hashing happens in pre-save hook)
  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  const { ip, userAgent } = extractRequestMeta(request);
  await audit({ userId: user._id.toString(), action: 'PASSWORD_RESET_COMPLETED', ip, userAgent });

  // Clear session cookie — force re-login
  const response = NextResponse.json({
    version: 'v1',
    ok: true,
    data: { message: 'Password has been reset. Please log in with your new password.' },
  });
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
