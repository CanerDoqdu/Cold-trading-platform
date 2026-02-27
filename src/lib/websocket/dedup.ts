// ============================================================
// Message Deduplication — LRU-based duplicate detection
// ============================================================
// Binance can send duplicate ticks during reconnect.
// We track the last N message fingerprints and silently drop dupes.
// Prevents: price flickering, double-counting trades.
// ============================================================

const DEFAULT_MAX_SIZE = 1000;

/**
 * LRU-style deduplication cache.
 * Uses a Map (insertion-ordered) so oldest entries are evicted first.
 */
export class MessageDeduplicator {
  private readonly cache: Map<string, number>;
  private readonly maxSize: number;

  constructor(maxSize = DEFAULT_MAX_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Check if a message fingerprint has been seen.
   * If NOT seen → stores it, returns `false` (not a duplicate).
   * If SEEN   → returns `true` (duplicate, caller should skip).
   */
  isDuplicate(fingerprint: string): boolean {
    if (this.cache.has(fingerprint)) {
      return true;
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }

    this.cache.set(fingerprint, Date.now());
    return false;
  }

  /** Generate fingerprint for a ticker update */
  static tickerFingerprint(symbol: string, price: string, eventTime: number): string {
    return `T:${symbol}:${price}:${eventTime}`;
  }

  /** Generate fingerprint for a trade */
  static tradeFingerprint(tradeId: number): string {
    return `R:${tradeId}`;
  }

  /** Clear all stored fingerprints */
  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}
