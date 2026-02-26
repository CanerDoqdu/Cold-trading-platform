/**
 * Two-tier caching: L1 (in-memory LRU) → L2 (Upstash Redis) → origin.
 *
 * In serverless: L1 lives per isolate (warm invocations save Redis calls).
 * L2 is shared across all instances via Upstash REST API.
 */

import { LRUCache } from 'lru-cache';
import { logger } from '@/lib/logger';

const log = logger.child({ module: 'cache' });

/* ── L1: in-memory LRU ── */
const l1 = new LRUCache<string, string>({
  max: 2_000,
  maxSize: 50 * 1024 * 1024, // 50 MB
  sizeCalculation: (value) => value.length,
  ttl: 60_000, // 60 s default
});

/* ── L2: Upstash Redis (lazy init) ── */
let redis: { get: (k: string) => Promise<unknown>; set: (k: string, v: unknown, opts?: { ex?: number }) => Promise<void>; del: (...keys: string[]) => Promise<void> } | null = null;

async function getRedis() {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    log.debug('Upstash not configured — L2 cache disabled');
    return null;
  }
  const { Redis } = await import('@upstash/redis');
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }) as unknown as typeof redis;
  return redis;
}

/* ── metrics ── */
let l1Hits = 0;
let l1Misses = 0;
let l2Hits = 0;
let l2Misses = 0;

export function getCacheMetrics() {
  const total = l1Hits + l1Misses;
  return {
    l1: { hits: l1Hits, misses: l1Misses, rate: total ? l1Hits / total : 0 },
    l2: { hits: l2Hits, misses: l2Misses, rate: (l2Hits + l2Misses) ? l2Hits / (l2Hits + l2Misses) : 0 },
  };
}

/* ── public API ── */

export async function cacheGet<T>(key: string): Promise<T | null> {
  // L1
  const l1Val = l1.get(key);
  if (l1Val !== undefined) {
    l1Hits++;
    return JSON.parse(l1Val) as T;
  }
  l1Misses++;

  // L2
  const r = await getRedis();
  if (!r) return null;
  try {
    const l2Val = await r.get(key);
    if (l2Val != null) {
      l2Hits++;
      l1.set(key, JSON.stringify(l2Val)); // promote to L1
      return l2Val as T;
    }
    l2Misses++;
  } catch (err) {
    log.warn('L2 cache get error', { key, error: (err as Error).message });
  }
  return null;
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
  l1.set(key, JSON.stringify(value), { ttl: ttlSeconds * 1_000 });
  const r = await getRedis();
  if (!r) return;
  try {
    await r.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    log.warn('L2 cache set error', { key, error: (err as Error).message });
  }
}

export async function cacheInvalidate(...keys: string[]): Promise<void> {
  for (const k of keys) l1.delete(k);
  const r = await getRedis();
  if (!r || keys.length === 0) return;
  try {
    await r.del(...keys);
  } catch (err) {
    log.warn('L2 cache invalidate error', { error: (err as Error).message });
  }
}

/**
 * Cache-aside helper: fetch from cache, or call origin and cache the result.
 */
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 60,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached != null) return cached;

  const value = await fetchFn();
  await cacheSet(key, value, ttlSeconds);
  return value;
}
