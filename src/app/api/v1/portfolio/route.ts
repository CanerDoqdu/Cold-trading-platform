/**
 * Portfolio API v1 — GET /api/v1/portfolio
 *
 * Returns the user's portfolio with real-time P&L calculations,
 * allocation percentages, and daily change from snapshots.
 *
 * Query params:
 *   ?history=7|30|90 — include performance chart data (default: omitted)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/dal';
import { cookies } from 'next/headers';
import { getPortfolioPnL, getPortfolioHistory } from '@/lib/pnl';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'api:v1:portfolio' });

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const correlationId = req.headers.get('x-request-id') ?? crypto.randomUUID();

  try {
    // 1. Authenticate
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'UNAUTHORIZED', message: 'Not logged in' } },
        { status: 401 },
      );
    }

    const session = await verifySession(token);
    if (!session?._id) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid session' } },
        { status: 401 },
      );
    }

    const userId = String(session._id);
    const paperBalanceMinor = String(session.paperBalanceMinor ?? '1000000'); // default $10k

    // 2. Get P&L data (single batch price fetch, not per-holding)
    const pnlData = await getPortfolioPnL(userId, paperBalanceMinor);

    // 3. Optionally include history for performance charts
    const historyParam = req.nextUrl.searchParams.get('history');
    let history = null;
    if (historyParam) {
      const days = Math.min(Math.max(parseInt(historyParam, 10) || 30, 1), 365);
      history = await getPortfolioHistory(userId, days);
    }

    log.debug('Portfolio fetched', {
      correlationId,
      userId,
      holdingsCount: pnlData.holdings.length,
      totalValue: pnlData.totalValue.toFixed(2),
    });

    return NextResponse.json({
      version: 'v1',
      ok: true,
      data: {
        ...pnlData,
        ...(history ? { history } : {}),
      },
    });
  } catch (err) {
    log.error('Portfolio fetch failed', { correlationId, error: (err as Error).message });
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch portfolio' } },
      { status: 500 },
    );
  }
}
