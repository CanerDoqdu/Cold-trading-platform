import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const daysParam = req.nextUrl.searchParams.get('days');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const days = Math.max(1, Number(daysParam ?? 7));
  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`;
  const cacheKey = `market_chart_${id}_${days}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (upstream.status === 429) {
      const cached = marketCache.get(cacheKey);
      if (cached) {
        console.warn(`429 rate limit, serving cached chart for ${id}`);
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
    marketCache.set(cacheKey, data, 5 * 60 * 1000);
    return withCacheHeaders(NextResponse.json(data));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch market chart', details: (error as Error).message },
      { status: 502 },
    );
  }
}
