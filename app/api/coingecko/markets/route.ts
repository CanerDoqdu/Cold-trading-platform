import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';
import { withErrorHandler, AppError } from '@/lib/errors';
import { config } from '@/lib/config';
import { deduplicator, normalizeMarketData } from '@/lib/cache';
import { logger } from '@/lib/logger';

const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';
const log = logger.child({ route: 'coingecko/markets' });

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams;
  const vsCurrency = search.get('vs_currency') ?? 'usd';
  const order = search.get('order') ?? 'market_cap_desc';
  const perPage = Number(search.get('per_page') ?? 8);
  const page = Number(search.get('page') ?? 1);
  const sparkline = search.get('sparkline') ?? 'false';
  const priceChangePercentage = search.get('price_change_percentage') ?? '';
  const ids = search.get('ids') ?? '';

  const sanitizedPerPage = Math.min(Math.max(perPage, 1), 100);
  const sanitizedPage = Math.max(page, 1);

  let url = `${config.coingeckoBaseUrl}/coins/markets?vs_currency=${encodeURIComponent(vsCurrency)}&order=${encodeURIComponent(order)}&per_page=${sanitizedPerPage}&page=${sanitizedPage}&sparkline=${encodeURIComponent(sparkline)}`;

  if (ids) url += `&ids=${encodeURIComponent(ids)}`;
  if (priceChangePercentage) url += `&price_change_percentage=${encodeURIComponent(priceChangePercentage)}`;

  const cacheKey = `markets_${vsCurrency}_${order}_${sanitizedPerPage}_${sanitizedPage}_${priceChangePercentage}_${ids}`;

  // Check cache first (before hitting CoinGecko)
  const cached = marketCache.get(cacheKey);
  if (cached) {
    log.debug('Cache HIT', { cacheKey });
    return withCacheHeaders(NextResponse.json(cached));
  }

  // Deduplicated fetch — if 10 users request same page simultaneously,
  // only ONE request goes to CoinGecko. Others await the same Promise.
  const data = await deduplicator.dedupe(cacheKey, async () => {
    log.debug('Cache MISS, fetching upstream', { cacheKey });

    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (upstream.status === 429) {
      // Try stale cache on rate limit
      const stale = marketCache.get(cacheKey);
      if (stale) {
        log.warn('Rate limited, serving stale cache', { cacheKey });
        return stale;
      }
      throw new AppError('COINGECKO_ERROR', 'CoinGecko rate limited and no cache available');
    }

    if (!upstream.ok) {
      throw new AppError('COINGECKO_ERROR', `CoinGecko returned ${upstream.status}`, {
        upstreamStatus: upstream.status,
      });
    }

    return upstream.json();
  });

  // Normalize + cache the response
  const normalized = Array.isArray(data) ? normalizeMarketData(data) : data;
  marketCache.set(cacheKey, normalized, config.cacheTTLDefault);
  return withCacheHeaders(NextResponse.json(normalized));
});
