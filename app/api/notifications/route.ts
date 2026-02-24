import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/notificationModel';
import { withErrorHandler, AppError } from '@/lib/errors';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) throw AppError.unauthorized('No auth token');
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    throw AppError.unauthorized('Invalid token');
  }
}

// GET - Fetch user's notifications
export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getUserId();
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const unreadOnly = searchParams.get('unread') === 'true';

  const query: Record<string, unknown> = { userId };
  if (unreadOnly) {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return NextResponse.json({ 
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
    throw AppError.validation('Notification ID required');
  }

  await Notification.findOneAndDelete({ _id: notificationId, userId });

  return NextResponse.json({ success: true });
});
