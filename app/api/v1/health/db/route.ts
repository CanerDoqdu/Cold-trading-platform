import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const state = mongoose.connection.readyState;
    // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    if (state !== 1) {
      return NextResponse.json({ status: 'degraded', db: 'not connected', readyState: state }, { status: 503 });
    }
    // ping check
    await mongoose.connection.db!.admin().ping();
    return NextResponse.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    return NextResponse.json({ status: 'error', db: (err as Error).message }, { status: 503 });
  }
}
