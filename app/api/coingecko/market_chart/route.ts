import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';
import { withErrorHandler, AppError } from '@/lib/errors';
import { config } from '@/lib/config';
import { deduplicator } from '@/lib/cache';
import { logger } from '@/lib/logger';

const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';
const log = logger.child({ route: 'coingecko/market_chart' });

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get('id');
  const daysParam = req.nextUrl.searchParams.get('days');

  if (!id) {
    throw AppError.validation('id query parameter is required');
  }

  const days = Math.max(1, Number(daysParam ?? 7));
  const cacheKey = `market_chart_${id}_${days}`;

  // Check cache first
  const cached = marketCache.get(cacheKey);
  if (cached) {
    log.debug('Cache HIT', { cacheKey });
    return withCacheHeaders(NextResponse.json(cached));
  }

  // Deduplicated chart fetch
  const data = await deduplicator.dedupe(cacheKey, async () => {
    const url = `${config.coingeckoBaseUrl}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`;
    log.debug('Cache MISS, fetching chart', { coinId: id, days });

    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (upstream.status === 429) {
      const stale = marketCache.get(cacheKey);
      if (stale) {
        log.warn('Rate limited, serving stale chart', { coinId: id });
        return stale;
      }
      throw new AppError('COINGECKO_ERROR', 'CoinGecko rate limited and no chart cache');
    }

    if (!upstream.ok) {
      throw new AppError('COINGECKO_ERROR', `CoinGecko chart returned ${upstream.status}`, {
        upstreamStatus: upstream.status,
      });
    }

    return upstream.json();
  });

  marketCache.set(cacheKey, data, 5 * 60 * 1000);
  return withCacheHeaders(NextResponse.json(data));
});
