/**
 * ============================================
 * SERVER-SIDE RATE LIMITER
 * ============================================
 * Sliding window rate limiter — same technique used by
 * Binance, Stripe, Cloudflare, Discord, and every high-traffic API.
 *
 * Prevents:
 *  - DDoS / brute-force attacks
 *  - Bot spam on login/signup
 *  - API abuse that can crash the server
 *  - Excessive DB queries from a single user
 *
 * How it works:
 *  Each IP gets a "window" of X seconds. If they exceed Y requests
 *  in that window, they get 429 Too Many Requests until the window resets.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number; // timestamp when window resets
}

interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  message?: string;       // Custom error message
}

// Pre-defined profiles for different route types
export const RATE_LIMIT_PROFILES = {
  // General API — generous for normal browsing
  api: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 100,          // 100 req/min per IP
    message: 'Too many requests. Please try again in a minute.',
  },
  // Auth routes — strict to prevent brute force
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,           // 10 attempts per 15 min
    message: 'Too many login attempts. Please try again later.',
  },
  // Data-heavy routes (market data, charts) — moderate
  data: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 60,           // 60 req/min
    message: 'Rate limit exceeded for data requests.',
  },
  // Chat/AI routes — limited (expensive calls)
  ai: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 15,           // 15 req/min
    message: 'Too many AI requests. Please slow down.',
  },
  // Notification/portfolio writes — moderate
  write: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,           // 30 req/min
    message: 'Too many write operations. Please slow down.',
  },
  // Per-user authenticated API — generous per user
  authenticated: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 200,          // 200 req/min per userId
    message: 'Too many requests for your account. Please slow down.',
  },
  // Trading routes — strict per user
  trading: {
    windowMs: 60 * 1000,      // 1 minute
    maxRequests: 30,           // 30 orders/min per userId
    message: 'Too many order requests. Please slow down.',
  },
} as const;

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Auto-cleanup expired entries every 5 minutes to prevent memory leak
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if a request should be allowed
   * Returns { allowed, remaining, resetTime, retryAfter }
   */
  check(
    identifier: string,
    config: RateLimitConfig
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter: number; // seconds until reset (0 if allowed)
    limit: number;
  } {
    const now = Date.now();
    const key = identifier;
    const entry = this.store.get(key);

    // No entry or window expired → fresh window
    if (!entry || now >= entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
        retryAfter: 0,
        limit: config.maxRequests,
      };
    }

    // Window still active
    if (entry.count < config.maxRequests) {
      entry.count++;
      return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
        retryAfter: 0,
        limit: config.maxRequests,
      };
    }

    // Rate limited!
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
      limit: config.maxRequests,
    };
  }

  /**
   * Remove expired entries to prevent memory leak
   * Critical for high-traffic: without this, the Map grows forever
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[RateLimiter] Cleaned ${cleaned} expired entries. Active: ${this.store.size}`);
    }
  }

  /** Get current store size (for monitoring) */
  get size(): number {
    return this.store.size;
  }

  /** Force cleanup (useful for tests) */
  forceCleanup(): void {
    this.cleanup();
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// ============================
// SINGLETON — shared across all API routes
// ============================
const globalForRateLimit = globalThis as any;
export const rateLimiter: RateLimiter =
  globalForRateLimit.__rateLimiter ?? (globalForRateLimit.__rateLimiter = new RateLimiter());

/**
 * Helper: Extract client IP from request
 * Works with Vercel, Cloudflare, nginx, and direct connections
 */
export function getClientIP(request: Request): string {
  // Vercel / most reverse proxies
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;

  // Real IP header (nginx)
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;

  return 'unknown';
}

/**
 * Determine which rate limit profile to use based on the route path
 */
export function getProfileForPath(path: string): RateLimitConfig {
  // Auth routes — strictest
  if (path.startsWith('/api/user') || path.includes('/login') || path.includes('/signup') || path.includes('/google')) {
    return RATE_LIMIT_PROFILES.auth;
  }

  // AI/Chat routes — expensive
  if (path.startsWith('/api/chat') || path.startsWith('/api/description-api')) {
    return RATE_LIMIT_PROFILES.ai;
  }

  // Market data routes — moderate  
  if (path.startsWith('/api/coingecko') || path.startsWith('/api/getCombinedData') || path.startsWith('/api/consolidatedData')) {
    return RATE_LIMIT_PROFILES.data;
  }

  // Write operations
  if (path.startsWith('/api/notifications') || path.startsWith('/api/price-alerts')) {
    return RATE_LIMIT_PROFILES.write;
  }

  // Everything else — general
  return RATE_LIMIT_PROFILES.api;
}
