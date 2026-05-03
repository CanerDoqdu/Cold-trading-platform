import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { marketCache, nftCache, contentCache, generalCache } from '@/lib/serverCache';
import { rateLimiter } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const startTime = Date.now();

const COINGECKO_BASE =
  process.env.COINGECKO_BASE || 'https://api.coingecko.com/api/v3';

/**
 * Enhanced health endpoint — checks MongoDB, CoinGecko, memory, caches.
 * Returns structured status for monitoring dashboards and uptime checkers.
 */
export async function GET() {
  const checks: Record<string, unknown> = {};

  /* ── MongoDB ──────────────────────────────────────────── */
  let dbStatus: 'connected' | 'connecting' | 'disconnected' = 'disconnected';
  let dbLatencyMs: number | null = null;
  try {
    const dbState = mongoose.connection.readyState;
    dbStatus =
      dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

    if (dbState === 1 && mongoose.connection.db) {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - pingStart;
    }
  } catch {
    dbStatus = 'disconnected';
  }
  checks.db = { status: dbStatus, latencyMs: dbLatencyMs };

  /* ── CoinGecko ────────────────────────────────────────── */
  let coingeckoOk = false;
  let coingeckoLatencyMs: number | null = null;
  try {
    const cgStart = Date.now();
    const res = await fetch(`${COINGECKO_BASE}/ping`, {
      signal: AbortSignal.timeout(5_000),
    });
    coingeckoLatencyMs = Date.now() - cgStart;
    coingeckoOk = res.ok;
  } catch {
    coingeckoOk = false;
  }
  checks.coingecko = { ok: coingeckoOk, latencyMs: coingeckoLatencyMs };

  /* ── Memory ───────────────────────────────────────────── */
  const mem = process.memoryUsage();
  const memoryMB = Math.round(mem.rss / 1024 / 1024);
  checks.memoryMB = memoryMB;
  checks.heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);

  /* ── Caches ───────────────────────────────────────────── */
  checks.caches = {
    market: marketCache.getStats(),
    nft: nftCache.getStats(),
    content: contentCache.getStats(),
    general: generalCache.getStats(),
  };

  /* ── Rate Limiter ─────────────────────────────────────── */
  checks.rateLimiter = { activeTrackedIPs: rateLimiter.size };

  /* ── Overall status ───────────────────────────────────── */
  const isHealthy = dbStatus === 'connected' && coingeckoOk && memoryMB < 450;
  const isDegraded = dbStatus === 'connected' && (!coingeckoOk || memoryMB >= 400);

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1_000),
      checks,
    },
    { status: isHealthy || isDegraded ? 200 : 503 },
  );
}
