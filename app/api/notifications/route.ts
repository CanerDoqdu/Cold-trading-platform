import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/notificationModel';
import { AppError, withErrorHandler } from '@/lib/errors';
import { config } from '@/lib/config';

const getJwtSecret = () => new TextEncoder().encode(config.jwtSecret);

async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) throw new AppError('UNAUTHORIZED', 'No session token');
  
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload.userId as string;
  } catch {
    throw new AppError('TOKEN_INVALID');
  }
}

// GET - Fetch user's notifications
export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getUserId();
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const unreadOnly = searchParams.get('unread') === 'true';

  const query: any = { userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return NextResponse.json({ 
    success: true,
    notifications, 
    unreadCount 
  });
});

// PUT - Mark notifications as read
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const userId = await getUserId();
  await dbConnect();

  const body = await request.json();
  const { notificationId, markAllRead } = body;

  if (!markAllRead && !notificationId) {
    throw AppError.validation('Either notificationId or markAllRead is required');
  }

  if (markAllRead) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  } else if (notificationId) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true }
    );
  }

  return NextResponse.json({ success: true });
});

// DELETE - Delete a notification
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const userId = await getUserId();
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('id');

  if (!notificationId) {
    throw AppError.validation('Notification ID is required', { field: 'id' });
  }

  await Notification.findOneAndDelete({ _id: notificationId, userId });

  return NextResponse.json({ success: true });
});
