import { NextRequest, NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_CONTROL = 's-maxage=30, stale-while-revalidate=300';

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const ids = search.get('ids') ?? 'bitcoin,ethereum,solana,cardano,ripple,dogecoin';
  const vs = search.get('vs_currencies') ?? 'usd';

  const url = `${COINGECKO_BASE}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 30 },
    });

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
    return withCacheHeaders(NextResponse.json(data));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch simple price', details: (error as Error).message },
      { status: 502 },
    );
  }
}
