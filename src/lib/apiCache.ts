// Professional API caching system (like TradingView, Binance)
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private memoryCache: Map<string, any> = new Map();
  // Track in-flight requests to dedupe concurrent fetches
  private inFlight: Map<string, Promise<any>> = new Map();

  // Get cached data if valid, otherwise return null
  get(key: string, ttl: number = 60000): any | null {
    // Try memory cache first (faster)
    const memEntry = this.memoryCache.get(key);
    if (memEntry) return memEntry;

    // Try localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`api_cache_${key}`);
        if (stored) {
          const entry: CacheEntry = JSON.parse(stored);
          const age = Date.now() - entry.timestamp;
          
          if (age < ttl) {
            // Still valid, restore to memory cache
            this.memoryCache.set(key, entry.data);
            return entry.data;
          } else {
            // Expired, remove
            localStorage.removeItem(`api_cache_${key}`);
          }
        }
      } catch (e) {
        console.warn('Cache read error:', e);
      }
    }

    return null;
  }

  // Set cache with TTL
  set(key: string, data: any, ttl: number = 60000): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    };

    // Set in memory cache
    this.memoryCache.set(key, data);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`api_cache_${key}`, JSON.stringify(entry));
      } catch (e) {
        console.warn('Cache write error (quota exceeded?):', e);
      }
    }
  }

  // Clear specific key
  clear(key: string): void {
    this.memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`api_cache_${key}`);
    }
  }

  // Clear all cache
  clearAll(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }

  // Clear expired entries (cleanup)
  cleanup(): void {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('api_cache_')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const entry: CacheEntry = JSON.parse(stored);
              const age = Date.now() - entry.timestamp;
              if (age >= entry.expiresIn) {
                localStorage.removeItem(key);
              }
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    }
  }

  // In-flight helpers
  getInFlight(key: string): Promise<any> | undefined {
    return this.inFlight.get(key);
  }

  setInFlight(key: string, promise: Promise<any>): void {
    // Wrap to prevent unhandled rejections from abort errors
    const safePromise = promise.catch(err => {
      if ((err as any)?.name === 'AbortError' || err === 'route-change') {
        // Swallow abort errors silently in background
        return;
      }
      // Re-throw other errors
      throw err;
    });
    
    this.inFlight.set(key, promise); // Store original for callers who await
    safePromise.finally(() => this.inFlight.delete(key));
  }
}

// Singleton instance
export const apiCache = new APICache();

// Cached fetch wrapper with retry + dedupe + stale-while-revalidate
export async function cachedFetch(
  url: string,
  options: RequestInit = {},
  ttl: number = 120000, // 2 minutes default
  maxRetries: number = 2,
  staleTtl: number = 60000 // serve stale up to +60s while revalidating
): Promise<any> {
  const cacheKey = url;

  // Serve fresh cache if valid
  const cached = apiCache.get(cacheKey, ttl);
  if (cached) {
    console.log('✅ Cache HIT:', url);
    return cached;
  }

  // Serve stale while revalidating
  const staleCandidate = apiCache.get(cacheKey, ttl + staleTtl);
  const inFlight = apiCache.getInFlight(cacheKey);

  if (inFlight) {
    console.log('⏳ Awaiting in-flight request:', url);
    return inFlight;
  }

  if (staleCandidate) {
    console.log('♻️ Serving stale data, revalidating in background:', url);
    // Trigger background revalidate but return stale immediately
    const bgPromise = fetchWithRetry(url, options, ttl, maxRetries).catch(() => undefined);
    apiCache.setInFlight(cacheKey, bgPromise as Promise<any>);
    return staleCandidate;
  }

  // No cache, fetch now with retry and dedupe
  const fetchPromise = fetchWithRetry(url, options, ttl, maxRetries);
  apiCache.setInFlight(cacheKey, fetchPromise);
  
  // Catch abort errors to prevent unhandled rejections
  return fetchPromise.catch(err => {
    if ((err as any)?.name === 'AbortError' || err === 'route-change') {
      // Silently re-throw abort errors (caller will handle)
      throw err;
    }
    throw err;
  });
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  ttl: number,
  maxRetries: number
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        }
      });

      if (response.status === 429) {
        lastError = new Error('Rate limit exceeded');
        continue; // retry
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      apiCache.set(url, data, ttl);
      return data;
    } catch (error) {
      // Abort should stop retry loop immediately
      if ((error as any)?.name === 'AbortError') {
        throw error;
      }

      lastError = error as Error;
      if (attempt === maxRetries) break;
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

// Cleanup on app start
if (typeof window !== 'undefined') {
  apiCache.cleanup();
}
