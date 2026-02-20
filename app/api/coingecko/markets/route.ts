import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';
import { withErrorHandler, AppError } from '@/lib/errors';
import { config } from '@/lib/config';

const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';

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
  const ids = search.get('ids') ?? ''; // Support filtering by coin IDs

  const sanitizedPerPage = Math.min(Math.max(perPage, 1), 100); // Allow up to 100
  const sanitizedPage = Math.max(page, 1);

  let url = `${config.coingeckoBaseUrl}/coins/markets?vs_currency=${encodeURIComponent(vsCurrency)}&order=${encodeURIComponent(order)}&per_page=${sanitizedPerPage}&page=${sanitizedPage}&sparkline=${encodeURIComponent(sparkline)}`;
  
  // Add coin IDs filter if provided (for favorites)
  if (ids) {
    url += `&ids=${encodeURIComponent(ids)}`;
  }
  
  // Add price change percentage if requested (e.g., "7d,30d")
  if (priceChangePercentage) {
    url += `&price_change_percentage=${encodeURIComponent(priceChangePercentage)}`;
  }
  
  const cacheKey = `markets_${vsCurrency}_${order}_${sanitizedPerPage}_${sanitizedPage}_${priceChangePercentage}_${ids}`;

  const upstream = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  });

  if (upstream.status === 429) {
    const cached = marketCache.get(cacheKey);
    if (cached) {
      return withCacheHeaders(NextResponse.json(cached));
    }
    throw new AppError('COINGECKO_ERROR', 'CoinGecko rate limited and no cache available');
  }

  if (!upstream.ok) {
    throw new AppError('COINGECKO_ERROR', `CoinGecko returned ${upstream.status}`, {
      upstreamStatus: upstream.status,
    });
  }

  const data = await upstream.json();
  marketCache.set(cacheKey, data, config.cacheTTLDefault);
  return withCacheHeaders(NextResponse.json(data));
});
