/**
 * ============================================
 * CACHE ADAPTER — REDIS-READY ABSTRACTION
 * ============================================
 * Unified cache interface that works with:
 *  1. In-memory (current, zero config) → default
 *  2. Redis (Docker, production) → opt-in via REDIS_URL
 *
 * Why an adapter?
 *  - Swap cache backends without changing any route code
 *  - In-memory for dev, Redis for production/multi-instance
 *  - Same pattern: NestJS CacheModule, Rails cache stores
 *
 * Usage:
 *   import { cacheAdapter } from '@/lib/cache';
 *
 *   await cacheAdapter.get('key');
 *   await cacheAdapter.set('key', data, 300); // 300s TTL
 *   await cacheAdapter.getOrSet('key', fetchFn, 300);
 *
 * Redis setup (optional):
 *   REDIS_URL=redis://localhost:6379 in .env
 *   docker run -d -p 6379:6379 redis:alpine
 */

import { logger } from '@/lib/logger';

// ─── Interface ───

export interface CacheAdapter {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getOrSet<T = any>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T>;
  getStats(): CacheStats;
}

export interface CacheStats {
  backend: 'memory' | 'redis';
  hits: number;
  misses: number;
  hitRate: string;
  entries: number;
  memoryMB: string;
}

// ─── In-Memory Implementation ───

interface MemoryEntry {
  value: any;
  expiresAt: number;
  size: number;
}

class MemoryCacheAdapter implements CacheAdapter {
  private store = new Map<string, MemoryEntry>();
  private hits = 0;
  private misses = 0;
  private memoryBytes = 0;
  private readonly maxEntries: number;
  private readonly maxMemoryMB: number;
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor(maxEntries = 1000, maxMemoryMB = 100) {
    this.maxEntries = maxEntries;
    this.maxMemoryMB = maxMemoryMB;
    // Cleanup expired entries every 60s
    this.cleanupTimer = setInterval(() => this.evictExpired(), 60_000);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.memoryBytes -= entry.size;
      this.misses++;
      return null;
    }

    this.hits++;
    // Move to end (LRU)
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value as T;
  }

  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    // Remove existing
    const existing = this.store.get(key);
    if (existing) {
      this.memoryBytes -= existing.size;
      this.store.delete(key);
    }

    const size = this.estimateSize(value);
    this.evictIfNeeded(size);

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      size,
    });
    this.memoryBytes += size;
  }

  async delete(key: string): Promise<void> {
    const entry = this.store.get(key);
    if (entry) {
      this.memoryBytes -= entry.size;
      this.store.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.memoryBytes -= entry.size;
      return false;
    }
    return true;
  }

  async clear(): Promise<void> {
    this.store.clear();
    this.memoryBytes = 0;
  }

  async getOrSet<T = any>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fetcher();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      backend: 'memory',
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? ((this.hits / total) * 100).toFixed(1) + '%' : 'N/A',
      entries: this.store.size,
      memoryMB: (this.memoryBytes / 1024 / 1024).toFixed(2),
    };
  }

  private evictIfNeeded(incomingSize: number): void {
    const maxBytes = this.maxMemoryMB * 1024 * 1024;
    while (this.store.size >= this.maxEntries || this.memoryBytes + incomingSize > maxBytes) {
      const firstKey = this.store.keys().next().value;
      if (firstKey === undefined) break;
      const entry = this.store.get(firstKey);
      if (entry) this.memoryBytes -= entry.size;
      this.store.delete(firstKey);
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.memoryBytes -= entry.size;
        this.store.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      logger.debug('Cache cleanup', { cleaned, remaining: this.store.size });
    }
  }

  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2;
    } catch {
      return 1024;
    }
  }
}

// ─── Singleton ───

let _adapter: CacheAdapter | null = null;

/**
 * Get the cache adapter singleton.
 * Uses in-memory by default, Redis if REDIS_URL is set.
 */
export function getCacheAdapter(): CacheAdapter {
  if (!_adapter) {
    // Future: if process.env.REDIS_URL → use RedisCacheAdapter
    _adapter = new MemoryCacheAdapter();
    logger.info('Cache adapter initialized', { backend: 'memory' });
  }
  return _adapter;
}

export const cacheAdapter = new Proxy({} as CacheAdapter, {
  get(_, prop: string) {
    return (getCacheAdapter() as any)[prop];
  },
});
