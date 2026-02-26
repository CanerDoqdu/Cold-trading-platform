/**
 * DataLoader pattern — batch-fetch prices for multiple coins in a single call
 * instead of N+1 individual requests.
 */

import { getCached } from '@/lib/cache';
import { CacheKeys, CacheTTL } from '@/lib/cache/keys';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'dataLoader' });

const COINGECKO_API = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
const COINGECKO_KEY = process.env.COINGECKO_API_KEY || '';

/**
 * Batch-fetch current prices for an array of coin IDs.
 * Returns a map: { bitcoin: 50000, ethereum: 3200, ... }
 */
export async function batchFetchPrices(
  coinIds: string[],
): Promise<Record<string, number>> {
  if (coinIds.length === 0) return {};

  const unique = [...new Set(coinIds)];

  // try cache first — collect misses
  const result: Record<string, number> = {};
  const misses: string[] = [];

  for (const id of unique) {
    const cached = await getCached<number>(
      CacheKeys.currentPrice(id),
      async () => null as unknown as number, // dummy — just checking cache
      CacheTTL.currentPrice,
    );
    if (cached != null) {
      result[id] = cached;
    } else {
      misses.push(id);
    }
  }

  if (misses.length === 0) return result;

  // single request for all misses
  try {
    const params = new URLSearchParams({
      ids: misses.join(','),
      vs_currencies: 'usd',
    });
    const headers: Record<string, string> = {};
    if (COINGECKO_KEY) headers['x-cg-demo-key'] = COINGECKO_KEY;

    const res = await fetch(`${COINGECKO_API}/simple/price?${params}`, {
      headers,
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) {
      log.warn('CoinGecko batch price fetch failed', { status: res.status });
      return result;
    }

    const data = (await res.json()) as Record<string, { usd: number }>;
    for (const [id, price] of Object.entries(data)) {
      result[id] = price.usd;
      // warm individual caches
      await getCached(
        CacheKeys.currentPrice(id),
        async () => price.usd,
        CacheTTL.currentPrice,
      );
    }
  } catch (err) {
    log.warn('CoinGecko batch fetch error', { error: (err as Error).message });
  }

  return result;
}
