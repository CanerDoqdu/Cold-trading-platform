/**
 * Cache key naming: {namespace}:{entity}:{id}:{version}
 * Bump version on schema changes for instant invalidation.
 */

const V = 'v1';

export const CacheKeys = {
  currentPrice: (coinId: string) => `price:${coinId}:current:${V}`,
  marketTop: (n: number) => `market:top${n}:${V}`,
  portfolio: (userId: string) => `portfolio:user:${userId}:holdings:${V}`,
  userProfile: (userId: string) => `user:${userId}:profile:${V}`,
  news: (page: number) => `news:page:${page}:${V}`,
  nftMeta: (slug: string) => `nft:${slug}:meta:${V}`,
} as const;

/** TTL (seconds) per entity type */
export const CacheTTL = {
  currentPrice: 10,
  marketTop: 60,
  portfolio: 30,
  news: 300,
  nftMetadata: 3600,
  staticContent: 86_400,
} as const;
