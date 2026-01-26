import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';

const fallbackCache = new Map<string, any>();

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

export async function GET(req: NextRequest) {
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

  let url = `${COINGECKO_BASE}/coins/markets?vs_currency=${encodeURIComponent(vsCurrency)}&order=${encodeURIComponent(order)}&per_page=${sanitizedPerPage}&page=${sanitizedPage}&sparkline=${encodeURIComponent(sparkline)}`;
  
  // Add coin IDs filter if provided (for favorites)
  if (ids) {
    url += `&ids=${encodeURIComponent(ids)}`;
  }
  
  // Add price change percentage if requested (e.g., "7d,30d")
  if (priceChangePercentage) {
    url += `&price_change_percentage=${encodeURIComponent(priceChangePercentage)}`;
  }
  
  const cacheKey = `markets_${vsCurrency}_${order}_${sanitizedPerPage}_${sanitizedPage}_${priceChangePercentage}_${ids}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (upstream.status === 429) {
      const cached = fallbackCache.get(cacheKey);
      if (cached) {
        console.warn('429 rate limit, serving cached markets');
        return withCacheHeaders(NextResponse.json(cached));
      }
      return NextResponse.json(
        { error: 'Rate limited and no cache available' },
        { status: 429 },
      );
    }

    if (!upstream.ok) {
      const body = await upstream.text();
      return withCacheHeaders(
        NextResponse.json(
          {
            error: 'Upstream CoinGecko error',
            status: upstream.status,
            body: body?.slice(0, 1000),
          },
          { status: upstream.status },
        ),
      );
    }

    const data = await upstream.json();
    fallbackCache.set(cacheKey, data);
    return withCacheHeaders(NextResponse.json(data));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch markets', details: (error as Error).message },
      { status: 502 },
    );
  }
}
