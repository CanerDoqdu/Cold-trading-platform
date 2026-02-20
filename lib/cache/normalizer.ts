/**
 * ============================================
 * RESPONSE NORMALIZATION CACHE
 * ============================================
 * Normalizes external API responses into a consistent internal format
 * before caching. This means:
 *
 *  1. CoinGecko, OpenSea, CryptoCompare all return different shapes
 *  2. Frontend shouldn't care about source differences
 *  3. Normalize once at the edge → cache the normalized version
 *  4. Every consumer gets the same predictable format
 *
 * Benefits:
 *  - API source changes don't break frontend
 *  - Smaller cache footprint (only store what's needed)
 *  - Type safety across the codebase
 *
 * Same pattern: BFF (Backend For Frontend), API Gateway normalization
 *
 * Usage:
 *   import { normalizeMarketData, normalizeCoinDetail } from '@/lib/cache/normalizer';
 */

// ─── Normalized Types ───

export interface NormalizedCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  sparkline7d?: number[];
  lastUpdated: string;
}

export interface NormalizedCoinDetail extends NormalizedCoin {
  description: string;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  categories: string[];
  links: {
    homepage: string;
    blockchain: string[];
    reddit: string;
    github: string[];
  };
}

export interface NormalizedNFTCollection {
  slug: string;
  name: string;
  image: string;
  description: string;
  floorPrice: number;
  floorPriceCurrency: string;
  totalVolume: number;
  owners: number;
  totalSupply: number;
  verified: boolean;
}

// ─── Normalizers ───

/**
 * Normalize CoinGecko /coins/markets response.
 * Strips unnecessary fields, ensures consistent shape.
 */
export function normalizeMarketData(raw: any[]): NormalizedCoin[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((coin) => ({
    id: coin.id || '',
    symbol: (coin.symbol || '').toUpperCase(),
    name: coin.name || '',
    image: coin.image || coin.thumb || '',
    currentPrice: Number(coin.current_price) || 0,
    marketCap: Number(coin.market_cap) || 0,
    marketCapRank: Number(coin.market_cap_rank) || 0,
    priceChange24h: Number(coin.price_change_24h) || 0,
    priceChangePercentage24h: Number(coin.price_change_percentage_24h) || 0,
    totalVolume: Number(coin.total_volume) || 0,
    high24h: Number(coin.high_24h) || 0,
    low24h: Number(coin.low_24h) || 0,
    sparkline7d: coin.sparkline_in_7d?.price,
    lastUpdated: coin.last_updated || new Date().toISOString(),
  }));
}

/**
 * Normalize CoinGecko /coins/:id response.
 */
export function normalizeCoinDetail(raw: any): NormalizedCoinDetail | null {
  if (!raw || !raw.id) return null;

  const market = raw.market_data || {};

  return {
    id: raw.id,
    symbol: (raw.symbol || '').toUpperCase(),
    name: raw.name || '',
    image: raw.image?.large || raw.image?.small || '',
    currentPrice: Number(market.current_price?.usd) || 0,
    marketCap: Number(market.market_cap?.usd) || 0,
    marketCapRank: Number(raw.market_cap_rank) || 0,
    priceChange24h: Number(market.price_change_24h) || 0,
    priceChangePercentage24h: Number(market.price_change_percentage_24h) || 0,
    totalVolume: Number(market.total_volume?.usd) || 0,
    high24h: Number(market.high_24h?.usd) || 0,
    low24h: Number(market.low_24h?.usd) || 0,
    lastUpdated: market.last_updated || new Date().toISOString(),
    description: raw.description?.en || '',
    circulatingSupply: Number(market.circulating_supply) || 0,
    totalSupply: Number(market.total_supply) || 0,
    maxSupply: market.max_supply ? Number(market.max_supply) : null,
    ath: Number(market.ath?.usd) || 0,
    athDate: market.ath_date?.usd || '',
    atl: Number(market.atl?.usd) || 0,
    atlDate: market.atl_date?.usd || '',
    categories: raw.categories?.filter(Boolean) || [],
    links: {
      homepage: raw.links?.homepage?.[0] || '',
      blockchain: raw.links?.blockchain_site?.filter(Boolean)?.slice(0, 3) || [],
      reddit: raw.links?.subreddit_url || '',
      github: raw.links?.repos_url?.github?.filter(Boolean) || [],
    },
  };
}

/**
 * Normalize OpenSea NFT collection response.
 */
export function normalizeNFTCollection(raw: any): NormalizedNFTCollection | null {
  if (!raw) return null;

  return {
    slug: raw.collection || raw.slug || '',
    name: raw.name || '',
    image: raw.image_url || raw.featured_image_url || '',
    description: raw.description || '',
    floorPrice: Number(raw.floor_price) || 0,
    floorPriceCurrency: raw.payment_token?.symbol || 'ETH',
    totalVolume: Number(raw.total_volume) || 0,
    owners: Number(raw.num_owners) || 0,
    totalSupply: Number(raw.total_supply) || 0,
    verified: raw.safelist_request_status === 'verified',
  };
}

/**
 * Calculate normalized response size reduction.
 * Useful for metrics.
 */
export function compressionRatio(raw: any, normalized: any): {
  rawBytes: number;
  normalizedBytes: number;
  savings: string;
} {
  const rawBytes = JSON.stringify(raw).length;
  const normalizedBytes = JSON.stringify(normalized).length;
  const savings = ((1 - normalizedBytes / rawBytes) * 100).toFixed(1);

  return { rawBytes, normalizedBytes, savings: `${savings}%` };
}
