/**
 * ============================================
 * REQUEST DEDUPLICATION (SERVER-SIDE)
 * ============================================
 * Prevents duplicate concurrent API calls to the same external endpoint.
 *
 * Problem:
 *   10 users hit /api/coingecko/markets at the same time
 *   → Without dedupe: 10 parallel calls to CoinGecko (rate limit hit)
 *   → With dedupe: 1 call to CoinGecko, 10 users share the result
 *
 * How it works:
 *   1. First request for a key → starts fetch, stores Promise
 *   2. Subsequent requests for same key → return same Promise
 *   3. Promise resolves → all waiters get the result
 *   4. Promise is deleted → next request triggers fresh fetch
 *
 * Same pattern: Apollo DataLoader, GraphQL batching, Redis Lua locks
 *
 * Usage:
 *   import { deduplicator } from '@/lib/cache/deduplicator';
 *
 *   const data = await deduplicator.dedupe('coingecko:markets', async () => {
 *     return fetch('https://api.coingecko.com/...');
 *   });
 */

import { logger } from '@/lib/logger';

interface InFlightEntry {
  promise: Promise<any>;
  timestamp: number;
  waiters: number;
}

class RequestDeduplicator {
  private inFlight = new Map<string, InFlightEntry>();

  // Max time a promise stays in-flight before force-clean (safety)
  private readonly maxAgeMs = 30_000; // 30 seconds

  /**
   * Deduplicate a request.
   * If the same key is already in-flight, returns the existing Promise.
   * Otherwise, starts a new request.
   */
  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check for existing in-flight request
    const existing = this.inFlight.get(key);

    if (existing) {
      // Verify it's not stale (safety net)
      if (Date.now() - existing.timestamp < this.maxAgeMs) {
        existing.waiters++;
        logger.debug('Request deduplicated', {
          key,
          waiters: existing.waiters,
        });
        return existing.promise as Promise<T>;
      }
      // Stale entry, clean up
      this.inFlight.delete(key);
    }

    // Start new request
    const entry: InFlightEntry = {
      promise: fetcher(),
      timestamp: Date.now(),
      waiters: 1,
    };

    this.inFlight.set(key, entry);

    try {
      const result = await entry.promise;
      return result;
    } finally {
      // Clean up after resolution (success or error)
      this.inFlight.delete(key);
    }
  }

  /**
   * Get the number of currently in-flight requests.
   */
  get activeCount(): number {
    return this.inFlight.size;
  }

  /**
   * Get stats for monitoring.
   */
  getStats() {
    const entries: Record<string, number> = {};
    for (const [key, entry] of this.inFlight.entries()) {
      entries[key] = entry.waiters;
    }
    return {
      activeRequests: this.inFlight.size,
      entries,
    };
  }
}

/**
 * Singleton deduplicator for server-side request deduplication.
 */
const g = globalThis as any;
export const deduplicator: RequestDeduplicator =
  g.__requestDeduplicator ?? (g.__requestDeduplicator = new RequestDeduplicator());
