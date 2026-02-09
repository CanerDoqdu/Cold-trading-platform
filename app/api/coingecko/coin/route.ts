import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';

function withCacheHeaders<T>(response: NextResponse<T>) {
  response.headers.set('Cache-Control', CACHE_CONTROL);
  return response;
}

// Convert markets data to coin detail format for fallback
function convertMarketsToCoin(marketData: any): any {
  return {
    id: marketData.id,
    symbol: marketData.symbol,
    name: marketData.name,
    image: {
      large: marketData.image,
      small: marketData.image,
      thumb: marketData.image,
    },
    market_data: {
      current_price: { usd: marketData.current_price },
      price_change_percentage_24h: marketData.price_change_percentage_24h,
      high_24h: { usd: marketData.high_24h },
      low_24h: { usd: marketData.low_24h },
      total_volume: { usd: marketData.total_volume },
      market_cap: { usd: marketData.market_cap },
      market_cap_rank: marketData.market_cap_rank,
      circulating_supply: marketData.circulating_supply,
      total_supply: marketData.total_supply,
      max_supply: marketData.max_supply,
      ath: { usd: marketData.ath || 0 },
      atl: { usd: marketData.atl || 0 },
    },
    description: {
      en: `${marketData.name} is a cryptocurrency with a market cap of $${(marketData.market_cap / 1e9).toFixed(2)}B and 24h trading volume of $${(marketData.total_volume / 1e9).toFixed(2)}B.`,
    },
  };
}

// Try to get markets data for fallback
async function getMarketsDataForCoin(coinId: string): Promise<any | null> {
  // First check if we have this coin in markets cache
  const cached = marketCache.get(`markets_coin_${coinId}`);
  if (cached) {
    return convertMarketsToCoin(cached);
  }

  // Fetch top 100 markets (single request covers most popular coins)
  try {
    const marketsUrl = `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
    const response = await fetch(marketsUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (response.ok) {
      const markets = await response.json();
      // Cache all coins from markets response (LRU auto-evicts old)
      markets.forEach((coin: any) => {
        marketCache.set(`markets_coin_${coin.id}`, coin, 10 * 60 * 1000);
      });

      const found = markets.find((c: any) => c.id === coinId);
      if (found) {
        return convertMarketsToCoin(found);
      }
    }
  } catch (e) {
    console.warn('Markets fallback fetch failed:', e);
  }

  return null;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const url = `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`;
  const cacheKey = `coin_${id}`;

  try {
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (upstream.status === 429) {
      // Rate limited: try caches in order
      const cached = marketCache.get(cacheKey);
      if (cached) {
        console.warn(`429 rate limit, serving cached coin data for ${id}`);
        return withCacheHeaders(NextResponse.json(cached));
      }

      // Try markets fallback
      const marketsFallback = await getMarketsDataForCoin(id);
      if (marketsFallback) {
        console.warn(`429 rate limit, serving markets fallback for ${id}`);
        return withCacheHeaders(NextResponse.json(marketsFallback));
      }

      return NextResponse.json(
        { error: 'Rate limited and no cache available' },
        { status: 429 },
      );
    }

    if (!upstream.ok) {
      // On any error, try markets fallback
      const marketsFallback = await getMarketsDataForCoin(id);
      if (marketsFallback) {
        console.warn(`Upstream error ${upstream.status}, serving markets fallback for ${id}`);
        return withCacheHeaders(NextResponse.json(marketsFallback));
      }

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
      { error: 'Failed to fetch coin', details: (error as Error).message },
      { status: 502 },
    );
  }
}
