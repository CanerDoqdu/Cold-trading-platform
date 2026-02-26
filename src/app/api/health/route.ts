import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { marketCache, nftCache, contentCache, generalCache } from '@/lib/serverCache';
import { rateLimiter } from '@/lib/rateLimit';
import { withErrorHandler } from '@/lib/errors';

/**
 * Health & monitoring endpoint
 * Used by: Every high-traffic site (Binance, Coinbase, Netflix)
 * 
 * Shows server cache stats, rate limiter status, memory usage, DB connectivity.
 * In production, you'd protect this with an admin key.
 */
export const GET = withErrorHandler(async () => {
  const memoryUsage = process.memoryUsage();

  // Check MongoDB connection state: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

  return NextResponse.json({
    status: dbState === 1 ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',

    // Database connectivity
    database: {
      status: dbStatus,
    },

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
});
