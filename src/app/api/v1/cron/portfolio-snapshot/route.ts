/**
 * Vercel Cron: portfolio-snapshot — runs daily at midnight UTC.
 * Takes a snapshot of each user's portfolio value for P&L history charts.
 * Snapshots are stored in a dedicated PortfolioSnapshot collection with TTL.
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Portfolio from '@/models/Portfolio.model';
import PortfolioSnapshot from '@/models/PortfolioSnapshot.model';
import { batchFetchPrices } from '@/lib/db/dataLoaders';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'cron:portfolio-snapshot' });

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();

  try {
    await dbConnect();

    const portfolios = await Portfolio.find({}).lean() as unknown as Array<{
      userId: string; holdings: Array<{ coinId: string; symbol: string; amount: number }>;
    }>;
    let snapshotCount = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (const p of portfolios) {
      if (!p.holdings || p.holdings.length === 0) continue;

      const coinIds = p.holdings.map((h) => h.coinId);
      const prices = await batchFetchPrices(coinIds);

      let totalValueCents = 0;
      const breakdown = p.holdings.map((h) => {
        const price = prices[h.coinId] || 0;
        const valueMicro = Math.round(h.amount * price * 1_000_000);
        totalValueCents += Math.round(h.amount * price * 100);
        return {
          coinId: h.coinId,
          symbol: h.symbol,
          amount: h.amount,
          valueMicroUsd: String(valueMicro),
        };
      });

      // Upsert snapshot (one per user per day — idempotent)
      await PortfolioSnapshot.findOneAndUpdate(
        { userId: p.userId, date: today },
        {
          $set: {
            totalValueMinor: String(totalValueCents),
            holdingBreakdown: breakdown,
          },
        },
        { upsert: true },
      );
      snapshotCount++;
    }

    log.info('Portfolio snapshots completed', { count: snapshotCount, durationMs: Date.now() - start });
    return NextResponse.json({ snapshots: snapshotCount, durationMs: Date.now() - start });
  } catch (err) {
    log.error('Portfolio snapshot failed', { error: (err as Error).message });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
