import { NextResponse } from 'next/server';
import { marketCache, nftCache, contentCache, generalCache } from '@/lib/serverCache';
import { rateLimiter } from '@/lib/rateLimit';

/**
 * Health & monitoring endpoint
 * Used by: Every high-traffic site (Binance, Coinbase, Netflix)
 * 
 * Shows server cache stats, rate limiter status, memory usage.
 * In production, you'd protect this with an admin key.
 */
export async function GET() {
  const memoryUsage = process.memoryUsage();

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',

    // Memory usage (critical for high traffic)
    memory: {
      heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
      rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
      externalMB: (memoryUsage.external / 1024 / 1024).toFixed(2),
    },

    // Cache statistics — shows hit rates, evictions, memory
    caches: {
      market: marketCache.getStats(),
      nft: nftCache.getStats(),
      content: contentCache.getStats(),
      general: generalCache.getStats(),
    },

    // Rate limiter status
    rateLimiter: {
      activeTrackedIPs: rateLimiter.size,
    },
  });
}
