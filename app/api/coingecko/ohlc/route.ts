import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';
import { withErrorHandler, AppError } from '@/lib/errors';
import { config } from '@/lib/config';
import { deduplicator } from '@/lib/cache';
import { logger } from '@/lib/logger';

const CACHE_CONTROL = 's-maxage=600, stale-while-revalidate=1200';
const ALLOWED_DAYS = [1, 7, 14, 30, 90, 180, 365] as const;
const log = logger.child({ route: 'coingecko/ohlc' });

type AllowedDay = (typeof ALLOWED_DAYS)[number];

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

function normalizeDays(value: number): AllowedDay {
  for (const allowed of ALLOWED_DAYS) {
    if (value <= allowed) return allowed;
  }
  return ALLOWED_DAYS[ALLOWED_DAYS.length - 1];
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get('id');
  const daysParam = req.nextUrl.searchParams.get('days');

  if (!id) {
    throw AppError.validation('id query parameter is required');
  }

  const parsedDays = Number(daysParam ?? 30);
  const days = normalizeDays(Number.isFinite(parsedDays) ? parsedDays : 30);
  const cacheKey = `ohlc_${id}_${days}`;

  // Check cache first
  const cached = marketCache.get(cacheKey);
  if (cached) {
    log.debug('Cache HIT', { cacheKey });
    return withCacheHeaders(NextResponse.json(cached));
  }

  // Deduplicated OHLC fetch
  const data = await deduplicator.dedupe(cacheKey, async () => {
    const url = `${config.coingeckoBaseUrl}/coins/${encodeURIComponent(id)}/ohlc?vs_currency=usd&days=${days}`;
    log.debug('Cache MISS, fetching OHLC', { coinId: id, days });

    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 600 },
    });

    if (upstream.status === 429) {
      const stale = marketCache.get(cacheKey);
      if (stale) {
        log.warn('Rate limited, serving stale OHLC', { coinId: id });
        return stale;
      }
      throw new AppError('COINGECKO_ERROR', 'CoinGecko rate limited and no OHLC cache');
    }

    if (!upstream.ok) {
      throw new AppError('COINGECKO_ERROR', `CoinGecko OHLC returned ${upstream.status}`, {
        upstreamStatus: upstream.status,
      });
    }

    return upstream.json();
  });

  marketCache.set(cacheKey, data, 10 * 60 * 1000);
  return withCacheHeaders(NextResponse.json(data));
});
