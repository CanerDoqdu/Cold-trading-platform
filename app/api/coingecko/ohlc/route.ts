import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_CONTROL = 's-maxage=600, stale-while-revalidate=1200';
const ALLOWED_DAYS = [1, 7, 14, 30, 90, 180, 365] as const;

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

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const daysParam = req.nextUrl.searchParams.get('days');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const parsedDays = Number(daysParam ?? 30);
  const days = normalizeDays(Number.isFinite(parsedDays) ? parsedDays : 30);
  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}/ohlc?vs_currency=usd&days=${days}`;
  const cacheKey = `ohlc_${id}_${days}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 600 },
    });

    if (upstream.status === 429) {
      const cached = marketCache.get(cacheKey);
      if (cached) {
        console.warn(`429 rate limit, serving cached OHLC for ${id}`);
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
    marketCache.set(cacheKey, data, 10 * 60 * 1000); // 10 min for OHLC
    return withCacheHeaders(NextResponse.json(data));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch OHLC', details: (error as Error).message },
      { status: 502 },
    );
  }
}
