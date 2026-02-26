/**
 * Vercel Cron: portfolio-snapshot — runs daily at midnight UTC.
 * Takes a snapshot of each user's portfolio value for P&L history charts.
 */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Portfolio from '@/models/portfolioModel';
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
      userId: string; holdings: Array<{ coinId: string; amount: number }>;
    }>;
    let snapshotCount = 0;

    for (const p of portfolios) {
      if (!p.holdings || p.holdings.length === 0) continue;

      const coinIds = p.holdings.map((h) => h.coinId);
      const prices = await batchFetchPrices(coinIds);

      let totalValue = 0;
      for (const h of p.holdings) {
        const price = prices[h.coinId] || 0;
        totalValue += h.amount * price;
      }

      // Save snapshot in the portfolio document (or a separate collection)
      await Portfolio.findOneAndUpdate(
        { userId: p.userId },
        {
          $push: {
            snapshots: {
              $each: [{ date: new Date(), totalValue }],
              $slice: -365, // keep last year of daily snapshots
            },
          },
        },
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
