import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import bcrypt from 'bcrypt';
import { withErrorHandler, AppError } from '@/lib/errors';
import { validate, schemas, verifyToken } from '@/lib/security';
import { logger } from '@/lib/logger';

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();

  // Validate input
  const { currentPassword, newPassword } = validate(body, schemas.changePassword);

  // Verify auth token
  const token = request.cookies.get('token')?.value;
  if (!token) {
    throw new AppError('UNAUTHORIZED');
  }

  const payload = await verifyToken(token, 'access');

  await dbConnect();

  // Find user
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError('USER_NOT_FOUND');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  user.password = hashedPassword;
  await user.save();

  logger.info('Password changed', { userId: payload.userId });

  return NextResponse.json(
    { success: true, message: 'Password changed successfully' },
    { status: 200 }
  );
});
