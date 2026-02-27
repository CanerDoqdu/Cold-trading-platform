/**
 * CollectionStats — Reusable stats grid for NFT collection pages.
 * Shows floor price, volume, avg price, owners, sales.
 */

import type { CollectionStats as CollectionStatsType } from '@/lib/opensea';

interface CollectionStatsProps {
  stats: CollectionStatsType;
}

function formatNumber(n: number | undefined | null): string {
  if (n == null) return '-';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString('en-US');
}

function formatEth(n: number | undefined | null, decimals = 2): string {
  if (n == null) return '-';
  return n.toFixed(decimals);
}

export default function CollectionStats({ stats }: CollectionStatsProps) {
  const t = stats.total;
  const oneDay = stats.intervals?.find((i) => i.interval === 'one_day');
  const volumeChange = oneDay?.volume_change;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
      {/* Floor Price */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50">
        <p className="text-lg sm:text-xl font-bold text-white">
          {formatEth(t?.floor_price)}{' '}
          <span className="text-xs text-gray-400">ETH</span>
        </p>
        <p className="text-xs text-gray-400">Floor Price</p>
      </div>

      {/* 24h Volume */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50">
        <p className="text-lg sm:text-xl font-bold text-white">
          {formatEth(oneDay?.volume ?? t?.volume)}
        </p>
        {volumeChange != null && (
          <p className={`text-xs ${volumeChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {volumeChange >= 0 ? '+' : ''}{(volumeChange * 100).toFixed(1)}%
          </p>
        )}
        <p className="text-xs text-gray-400">{oneDay ? '24h Volume' : 'Total Volume'}</p>
      </div>

      {/* Avg Price */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50">
        <p className="text-lg sm:text-xl font-bold text-white">
          {formatEth(t?.average_price, 3)}
        </p>
        <p className="text-xs text-gray-400">Avg Price</p>
      </div>

      {/* Owners */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50 hidden sm:block">
        <p className="text-lg sm:text-xl font-bold text-white">
          {formatNumber(t?.num_owners)}
        </p>
        <p className="text-xs text-gray-400">Owners</p>
      </div>

      {/* Market Cap */}
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50 hidden sm:block">
        <p className="text-lg sm:text-xl font-bold text-white">
          {formatEth(t?.market_cap)}
        </p>
        <p className="text-xs text-gray-400">Market Cap</p>
      </div>
    </div>
  );
}
