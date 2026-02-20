import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';
import { withErrorHandler, AppError } from '@/lib/errors';
import { config } from '@/lib/config';
import { deduplicator } from '@/lib/cache';
import { logger } from '@/lib/logger';

const CACHE_CONTROL = 's-maxage=30, stale-while-revalidate=300';
const log = logger.child({ route: 'coingecko/simple_price' });

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams;
  const ids = search.get('ids') ?? 'bitcoin,ethereum,solana,cardano,ripple,dogecoin';
  const vs = search.get('vs_currencies') ?? 'usd';

  const cacheKey = `simple_price_${ids}_${vs}`;

  // Short-TTL cache for price data (30s)
  const cached = marketCache.get(cacheKey);
  if (cached) {
    return withCacheHeaders(NextResponse.json(cached));
  }

  const data = await deduplicator.dedupe(cacheKey, async () => {
    const url = `${config.coingeckoBaseUrl}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`;
    log.debug('Fetching simple price', { ids, vs });

    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    });

    if (!upstream.ok) {
      throw new AppError('COINGECKO_ERROR', `CoinGecko simple/price returned ${upstream.status}`, {
        upstreamStatus: upstream.status,
      });
    }

    return upstream.json();
  });

  marketCache.set(cacheKey, data, 30_000); // 30s TTL for prices
  return withCacheHeaders(NextResponse.json(data));
});
