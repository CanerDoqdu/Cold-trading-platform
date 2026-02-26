/**
 * Vercel Cron: check-alerts — runs every 60 seconds.
 * Fetches untriggered alerts, batch-checks current prices, triggers notifications.
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PriceAlert from '@/models/priceAlertModel';
import Notification from '@/models/notificationModel';
import { batchFetchPrices } from '@/lib/db/dataLoaders';
import { sendPriceAlert } from '@/lib/email';
import User from '@/models/userModel';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'cron:check-alerts' });

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();

  try {
    await dbConnect();

    // fetch all untriggered alerts
    const alerts = await PriceAlert.find({ triggered: false }).lean() as unknown as Array<{
      _id: string; coinId: string; coinSymbol: string; condition: string; targetPrice: number; userId: string;
    }>;
    if (alerts.length === 0) {
      return NextResponse.json({ checked: 0, triggered: 0 });
    }

    // batch-fetch prices for all unique coins
    const coinIds = [...new Set(alerts.map((a) => a.coinId))];
    const prices = await batchFetchPrices(coinIds);

    let triggered = 0;

    for (const a of alerts) {
      const currentPrice = prices[a.coinId];
      if (currentPrice == null) continue;

      const hit =
        (a.condition === 'above' && currentPrice >= a.targetPrice) ||
        (a.condition === 'below' && currentPrice <= a.targetPrice);

      if (!hit) continue;

      // mark triggered
      await PriceAlert.findByIdAndUpdate(a._id, { triggered: true, triggeredAt: new Date() });

      // create in-app notification
      await Notification.create({
        userId: a.userId,
        type: 'price_alert',
        title: `${a.coinSymbol.toUpperCase()} ${a.condition} $${a.targetPrice.toLocaleString()}`,
        message: `Current price: $${currentPrice.toLocaleString()}`,
        isRead: false,
      });

      // send email (fire-and-forget)
      const user = await User.findById(a.userId).select('email').lean() as unknown as { email?: string } | null;
      if (user?.email) {
        sendPriceAlert(
          user.email,
          a.coinSymbol,
          currentPrice,
          a.condition,
        ).catch(() => {});
      }

      triggered++;
    }

    log.info('Cron check-alerts completed', { checked: alerts.length, triggered, durationMs: Date.now() - start });
    return NextResponse.json({ checked: alerts.length, triggered, durationMs: Date.now() - start });
  } catch (err) {
    log.error('Cron check-alerts failed', { error: (err as Error).message });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
