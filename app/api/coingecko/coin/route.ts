import { NextRequest, NextResponse } from 'next/server';
import { marketCache } from '@/lib/serverCache';
import { withErrorHandler, AppError } from '@/lib/errors';
import { config } from '@/lib/config';
import { deduplicator, normalizeCoinDetail } from '@/lib/cache';
import { logger } from '@/lib/logger';

const CACHE_CONTROL = 's-maxage=300, stale-while-revalidate=600';
const log = logger.child({ route: 'coingecko/coin' });

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
  const cached = marketCache.get(`markets_coin_${coinId}`);
  if (cached) return convertMarketsToCoin(cached);

  try {
    const marketsUrl = `${config.coingeckoBaseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`;

    // Deduplicate the markets fallback fetch too
    const markets = await deduplicator.dedupe('markets_fallback_top100', async () => {
      const response = await fetch(marketsUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 },
      });
      if (!response.ok) return null;
      return response.json();
    });

    if (markets && Array.isArray(markets)) {
      markets.forEach((coin: any) => {
        marketCache.set(`markets_coin_${coin.id}`, coin, 10 * 60 * 1000);
      });
      const found = markets.find((c: any) => c.id === coinId);
      if (found) return convertMarketsToCoin(found);
    }
  } catch (e) {
    log.warn('Markets fallback fetch failed', { coinId, error: (e as Error).message });
  }

  return null;
}

export const GET = withErrorHandler(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get('id');

  if (!id) {
    throw AppError.validation('id query parameter is required');
  }

  const cacheKey = `coin_${id}`;

  // 1) Check cache first
  const cached = marketCache.get(cacheKey);
  if (cached) {
    log.debug('Cache HIT', { coinId: id });
    return withCacheHeaders(NextResponse.json(cached));
  }

  // 2) Deduplicated external fetch — one request per coin, shared across concurrent callers
  const data = await deduplicator.dedupe(cacheKey, async () => {
    const url = `${config.coingeckoBaseUrl}/coins/${encodeURIComponent(id)}?localization=false&tickers=false&community_data=false&developer_data=false`;

    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (upstream.status === 429) {
      log.warn('Rate limited on coin detail', { coinId: id });
      const marketsFallback = await getMarketsDataForCoin(id);
      if (marketsFallback) return marketsFallback;
      throw new AppError('COINGECKO_ERROR', 'CoinGecko rate limited and no cache available');
    }

    if (!upstream.ok) {
      const marketsFallback = await getMarketsDataForCoin(id);
      if (marketsFallback) return marketsFallback;
      throw new AppError('COINGECKO_ERROR', `CoinGecko returned ${upstream.status}`, {
        upstreamStatus: upstream.status,
      });
    }

    return upstream.json();
  });

  // 3) Normalize + cache
  const normalized = normalizeCoinDetail(data);
  marketCache.set(cacheKey, normalized, 5 * 60 * 1000);
  return withCacheHeaders(NextResponse.json(normalized));
});
