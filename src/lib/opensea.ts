/**
 * Centralized OpenSea API Service
 *
 * All OpenSea API calls go through this module:
 * - API key header injection
 * - Rate-limit handling (429 → return stale cache + schedule retry)
 * - Server-side caching (nftCache from serverCache.ts, 15min TTL)
 * - Error classification (network / auth / rate-limit / not-found)
 */

import { nftCache } from '@/lib/serverCache';
import { logger } from '@/lib/logger';

/* ── Types ────────────────────────────────────────────────── */

export interface CollectionInfo {
  name: string;
  description: string;
  image_url: string;
  banner_image_url: string;
  owner: string;
  safelist_status: string;
  category: string;
  collection: string; // slug
  contracts: { address: string; chain: string }[];
  total_supply: number;
  created_date: string;
}

export interface CollectionStats {
  total: {
    volume: number;
    sales: number;
    average_price: number;
    num_owners: number;
    market_cap: number;
    floor_price: number;
    floor_price_symbol: string;
  };
  intervals: {
    interval: string;
    volume: number;
    volume_diff: number;
    volume_change: number;
    sales: number;
    sales_diff: number;
    average_price: number;
  }[];
}

export interface NFTItem {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  display_image_url: string;
  display_animation_url: string | null;
  metadata_url: string;
  opensea_url: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
  traits?: { trait_type: string; value: string }[];
}

export interface OpenSeaError {
  code: 'RATE_LIMITED' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'NETWORK' | 'UNKNOWN';
  message: string;
  status: number;
  retryAfter?: number; // seconds
}

/* ── Internals ────────────────────────────────────────────── */

const OPENSEA_BASE = 'https://api.opensea.io/api/v2';

function getApiKey(): string {
  const key = process.env.OPENSEA_API_KEY;
  if (!key) throw new Error('OPENSEA_API_KEY is missing from environment');
  return key;
}

function headers(): HeadersInit {
  return {
    'X-API-KEY': getApiKey(),
    Accept: 'application/json',
  };
}

/**
 * Core fetch wrapper with rate-limit + error classification.
 * Returns `{ data, fromCache }` or throws `OpenSeaError`.
 */
async function openSeaFetch<T>(
  path: string,
  cacheKey: string,
  cacheTTL = 15 * 60 * 1000,
): Promise<{ data: T; fromCache: boolean }> {
  // 1. Check cache first
  const cached = nftCache.get(cacheKey) as T | undefined;

  try {
    const res = await fetch(`${OPENSEA_BASE}${path}`, {
      method: 'GET',
      headers: headers(),
      next: { revalidate: 900 }, // ISR: 15min
    });

    // 2. Rate limited → return stale if available
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '60', 10);
      logger.warn('OpenSea rate limited', { path, retryAfter });

      if (cached) {
        return { data: cached, fromCache: true };
      }

      const err: OpenSeaError = {
        code: 'RATE_LIMITED',
        message: `Rate limited. Retry after ${retryAfter}s`,
        status: 429,
        retryAfter,
      };
      throw err;
    }

    // 3. Not found
    if (res.status === 404) {
      const err: OpenSeaError = {
        code: 'NOT_FOUND',
        message: `Resource not found: ${path}`,
        status: 404,
      };
      throw err;
    }

    // 4. Auth error
    if (res.status === 401 || res.status === 403) {
      const err: OpenSeaError = {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing OpenSea API key',
        status: res.status,
      };
      throw err;
    }

    // 5. Other errors
    if (!res.ok) {
      if (cached) {
        logger.warn('OpenSea error, returning cached data', { path, status: res.status });
        return { data: cached, fromCache: true };
      }
      const err: OpenSeaError = {
        code: 'UNKNOWN',
        message: `OpenSea API error: ${res.status} ${res.statusText}`,
        status: res.status,
      };
      throw err;
    }

    // 6. Success → update cache
    const data = (await res.json()) as T;
    nftCache.set(cacheKey, data, cacheTTL);
    return { data, fromCache: false };
  } catch (error) {
    // Network errors
    if (error && typeof error === 'object' && 'code' in error) {
      throw error; // Already classified
    }

    logger.error('OpenSea network error', { path, error: String(error) });

    if (cached) {
      return { data: cached, fromCache: true };
    }

    const err: OpenSeaError = {
      code: 'NETWORK',
      message: `Network error fetching OpenSea: ${String(error)}`,
      status: 0,
    };
    throw err;
  }
}

/* ── Public API ───────────────────────────────────────────── */

/**
 * Get collection info (name, description, image, contracts, etc.)
 */
export async function getCollection(slug: string): Promise<{ data: CollectionInfo; fromCache: boolean }> {
  return openSeaFetch<CollectionInfo>(
    `/collections/${slug}`,
    `collection:${slug}`,
  );
}

/**
 * Get collection stats (floor price, volume, sales, owners, etc.)
 */
export async function getCollectionStats(slug: string): Promise<{ data: CollectionStats; fromCache: boolean }> {
  return openSeaFetch<CollectionStats>(
    `/collections/${slug}/stats`,
    `collection_stats:${slug}`,
  );
}

/**
 * Get NFTs for a collection (first page, up to `limit`)
 */
export async function getNFTsByCollection(
  slug: string,
  limit = 50,
): Promise<{ data: NFTItem[]; fromCache: boolean }> {
  const result = await openSeaFetch<{ nfts: NFTItem[] }>(
    `/collection/${slug}/nfts?limit=${limit}`,
    `collection_nfts:${slug}:${limit}`,
  );
  return { data: result.data.nfts, fromCache: result.fromCache };
}

/**
 * Get NFT rankings (top collections by market cap).
 * Returns combined collection + stats data.
 */
export async function getNFTRankings(
  offset = 0,
  limit = 20,
): Promise<{
  data: { collection: CollectionInfo; stats: CollectionStats | null }[];
  fromCache: boolean;
}> {
  const cacheKey = `nft_rankings:${offset}:${limit}`;
  const cached = nftCache.get(cacheKey) as
    | { collection: CollectionInfo; stats: CollectionStats | null }[]
    | undefined;

  if (cached) {
    return { data: cached, fromCache: true };
  }

  // Fetch collection list
  const batchSize = Math.max(limit + offset, 100);
  const collectionsRes = await openSeaFetch<{ collections: CollectionInfo[] }>(
    `/collections?chain=ethereum&order_by=market_cap&offset=0&limit=${batchSize}`,
    `collections_list:${batchSize}`,
    10 * 60 * 1000, // 10min for list
  );

  const allCollections = collectionsRes.data.collections ?? [];
  const pageCollections = allCollections.slice(offset, offset + limit);

  // Fetch stats in parallel (with individual error handling)
  const results = await Promise.all(
    pageCollections.map(async (collection) => {
      const id =
        (collection as unknown as Record<string, unknown>).slug ??
        (collection as unknown as Record<string, unknown>).collection ??
        (collection as unknown as Record<string, unknown>).name;
      try {
        const { data: stats } = await getCollectionStats(String(id));
        return { collection, stats };
      } catch {
        return { collection, stats: null };
      }
    }),
  );

  // Filter to collections with valid stats
  const validResults = results.filter((r) => {
    if (!r.stats) return false;
    const t = r.stats.total;
    return t?.floor_price != null || t?.volume != null || t?.market_cap != null;
  });

  const finalData = validResults.length > 0 ? validResults : results;
  nftCache.set(cacheKey, finalData, 15 * 60 * 1000);

  return { data: finalData, fromCache: false };
}

/**
 * Get best offer for a specific NFT (with rate-limit protection).
 */
export async function getBestOffer(
  slug: string,
  identifier: string,
): Promise<{ data: Record<string, unknown>; fromCache: boolean }> {
  return openSeaFetch<Record<string, unknown>>(
    `/offers/collection/${slug}/nfts/${identifier}/best`,
    `best_offer:${slug}:${identifier}`,
    5 * 60 * 1000, // 5min TTL for offers
  );
}
