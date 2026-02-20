/**
 * ============================================
 * SERVER-SIDE LRU CACHE WITH TTL
 * ============================================
 * Used by: Netflix, Spotify, Binance, Coinbase
 *
 * Problem with plain Map (what you had before):
 *   - Grows infinitely → server runs out of memory → crash
 *   - No expiration → stale data served forever
 *
 * This LRU (Least Recently Used) cache:
 *   - Has a MAX SIZE → oldest unused items get evicted
 *   - Has TTL (Time To Live) → entries auto-expire
 *   - Prevents memory leaks under high traffic
 *   - O(1) get/set operations
 */

interface CacheItem<T> {
  value: T;
  expiresAt: number;
  size: number; // approximate byte size for memory tracking
}

interface ServerCacheOptions {
  maxEntries: number;     // Maximum number of entries (default: 500)
  defaultTTL: number;     // Default TTL in ms (default: 5 minutes)
  maxMemoryMB: number;    // Approximate max memory in MB (default: 50MB)
  name: string;           // Cache name for logging
}

class ServerCache<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private readonly options: ServerCacheOptions;
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private currentMemory = 0; // approximate bytes
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(options: Partial<ServerCacheOptions> = {}) {
    this.options = {
      maxEntries: options.maxEntries ?? 500,
      defaultTTL: options.defaultTTL ?? 5 * 60 * 1000, // 5 min
      maxMemoryMB: options.maxMemoryMB ?? 50,
      name: options.name ?? 'ServerCache',
    };

    // Auto-cleanup every 2 minutes
    this.cleanupInterval = setInterval(() => this.evictExpired(), 2 * 60 * 1000);
  }

  /**
   * Get a cached value. Returns undefined if not found or expired.
   * Moves the item to the "most recently used" position.
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);

    if (!item) {
      this.misses++;
      return undefined;
    }

    // Check TTL
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.currentMemory -= item.size;
      this.misses++;
      return undefined;
    }

    this.hits++;

    // Move to end (most recently used) — Map preserves insertion order
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  /**
   * Set a cached value with optional TTL override
   */
  set(key: string, value: T, ttl?: number): void {
    const effectiveTTL = ttl ?? this.options.defaultTTL;

    // Remove existing entry if present
    const existing = this.cache.get(key);
    if (existing) {
      this.currentMemory -= existing.size;
      this.cache.delete(key);
    }

    // Estimate size (rough approximation)
    const size = this.estimateSize(value);

    // Evict LRU items if we're at capacity
    this.evictIfNeeded(size);

    const item: CacheItem<T> = {
      value,
      expiresAt: Date.now() + effectiveTTL,
      size,
    };

    this.cache.set(key, item);
    this.currentMemory += size;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.currentMemory -= item.size;
      return false;
    }
    return true;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      this.currentMemory -= item.size;
      return this.cache.delete(key);
    }
    return false;
  }

  /**
   * Clear everything
   */
  clear(): void {
    this.cache.clear();
    this.currentMemory = 0;
  }

  /**
   * Get or set pattern — fetch from cache or compute and store
   * This is the most common pattern in high-traffic apps
   */
  async getOrSet(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetcher();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    return {
      name: this.options.name,
      entries: this.cache.size,
      maxEntries: this.options.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRate: totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(1) + '%' : 'N/A',
      evictions: this.evictions,
      memoryMB: (this.currentMemory / 1024 / 1024).toFixed(2),
      maxMemoryMB: this.options.maxMemoryMB,
    };
  }

  // ---- Private helpers ----

  /**
   * Evict least recently used items when at capacity
   */
  private evictIfNeeded(incomingSize: number): void {
    const maxMemoryBytes = this.options.maxMemoryMB * 1024 * 1024;

    // Evict by count
    while (this.cache.size >= this.options.maxEntries) {
      this.evictOldest();
    }

    // Evict by memory
    while (this.currentMemory + incomingSize > maxMemoryBytes && this.cache.size > 0) {
      this.evictOldest();
    }
  }

  /**
   * Remove the oldest (least recently used) entry
   */
  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      const item = this.cache.get(firstKey);
      if (item) {
        this.currentMemory -= item.size;
      }
      this.cache.delete(firstKey);
      this.evictions++;
    }
  }

  /**
   * Remove all expired entries
   */
  private evictExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.currentMemory -= item.size;
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(
        `[${this.options.name}] Evicted ${cleaned} expired entries. ` +
        `Active: ${this.cache.size}, Memory: ${(this.currentMemory / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  /**
   * Rough size estimation for memory tracking
   */
  private estimateSize(value: any): number {
    try {
      const json = JSON.stringify(value);
      return json.length * 2; // UTF-16 chars → ~2 bytes each
    } catch {
      return 1024; // fallback: 1KB estimate
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    this.currentMemory = 0;
  }
}

// ============================
// PRE-CONFIGURED CACHE INSTANCES
// ============================
const g = globalThis as any;

/** Cache for market/price data — high volume, short TTL */
export const marketCache: ServerCache =
  g.__marketCache ??
  (g.__marketCache = new ServerCache({
    name: 'MarketData',
    maxEntries: 200,
    defaultTTL: 5 * 60 * 1000,  // 5 min (prices change often)
    maxMemoryMB: 30,
  }));

/** Cache for NFT data — moderate volume, longer TTL */
export const nftCache: ServerCache =
  g.__nftCache ??
  (g.__nftCache = new ServerCache({
    name: 'NFTData',
    maxEntries: 100,
    defaultTTL: 15 * 60 * 1000, // 15 min
    maxMemoryMB: 20,
  }));

/** Cache for news/reddit/general data — longer TTL */
export const contentCache: ServerCache =
  g.__contentCache ??
  (g.__contentCache = new ServerCache({
    name: 'Content',
    maxEntries: 50,
    defaultTTL: 10 * 60 * 1000, // 10 min
    maxMemoryMB: 10,
  }));

/** Generic cache for anything else */
export const generalCache: ServerCache =
  g.__generalCache ??
  (g.__generalCache = new ServerCache({
    name: 'General',
    maxEntries: 300,
    defaultTTL: 5 * 60 * 1000,
    maxMemoryMB: 20,
  }));

export { ServerCache };
export default ServerCache;
