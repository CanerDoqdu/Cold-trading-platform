/**
 * ============================================
 * PERFORMANCE & CACHE — BARREL EXPORT
 * ============================================
 *
 * Single import for the entire performance layer:
 *
 *   import {
 *     cacheAdapter, deduplicator,         // server cache + dedup
 *     normalizeMarketData,               // response normalization
 *     WebSocketBatcher,                  // WS batching
 *   } from '@/lib/cache';
 */

// ---- Cache Adapter ----
export { getCacheAdapter, cacheAdapter } from './cacheAdapter';
export type { CacheAdapter, CacheStats } from './cacheAdapter';

// ---- Request Deduplicator ----
export { deduplicator } from './deduplicator';

// ---- Response Normalizers ----
export {
  normalizeMarketData,
  normalizeCoinDetail,
  normalizeNFTCollection,
} from './normalizer';
export type {
  NormalizedCoin,
  NormalizedCoinDetail,
  NormalizedNFTCollection,
} from './normalizer';

// ---- WebSocket Batcher ----
export { WebSocketBatcher } from './wsBatcher';
export type { BatcherOptions } from './wsBatcher';
