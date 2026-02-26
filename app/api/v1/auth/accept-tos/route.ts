import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/userModel';
import { TOS_VERSION } from '@/lib/config/appConfig';
import { audit, extractRequestMeta } from '@/lib/auditLog';

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

// ── POST /api/v1/auth/accept-tos ──────
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  user.tosAcceptedAt = new Date();
  user.tosVersion = TOS_VERSION;
  await user.save();

  const { ip, userAgent } = extractRequestMeta(request);
  await audit({
    userId,
    action: 'TOS_ACCEPTED',
    ip,
    userAgent,
    metadata: { version: TOS_VERSION },
  });

  return NextResponse.json({
    version: 'v1',
    ok: true,
    data: { message: `ToS version ${TOS_VERSION} accepted` },
  });
}
