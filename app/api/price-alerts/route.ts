import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import dbConnect from '@/lib/dbConnect';
import PriceAlert from '@/models/priceAlertModel';
import Notification from '@/models/notificationModel';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// GET - Fetch user's price alerts
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const alerts = await PriceAlert.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// POST - Create a new price alert
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { coinId, coinSymbol, coinName, coinImage, targetPrice, condition, currentPrice } = body;

    if (!coinId || !coinSymbol || !targetPrice || !condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already has an active alert for this coin with same condition
    const existingAlert = await PriceAlert.findOne({
      userId,
      coinId,
      condition,
      isActive: true
    });

    if (existingAlert) {
      return NextResponse.json({ 
        error: `You already have an active "${condition}" alert for ${coinSymbol.toUpperCase()}` 
      }, { status: 400 });
    }

    const alert = new PriceAlert({
      userId,
      coinId,
      coinSymbol: coinSymbol.toUpperCase(),
      coinName,
      coinImage,
      targetPrice,
      condition,
      priceAtCreation: currentPrice || targetPrice
    });

    await alert.save();

    return NextResponse.json({ 
      success: true, 
      alert,
      message: `Alert set! You'll be notified when ${coinSymbol.toUpperCase()} goes ${condition} $${targetPrice.toLocaleString()}`
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

// DELETE - Delete a price alert
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('id');

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    await PriceAlert.findOneAndDelete({ _id: alertId, userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
