'use client';

import PriceStalenessIndicator from '@/components/PriceStalenessIndicator';
import type { TickerData, DataFreshness, ConnectionStatus } from '@/lib/websocket/types';

interface MarketInfoProps {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  /** Real-time ticker overlay (from WebSocket) */
  liveTicker?: TickerData | null;
  /** Data freshness for staleness badge */
  freshness?: DataFreshness;
  /** WebSocket connection status */
  connectionStatus?: ConnectionStatus;
}

const formatLarge = (num: number) => {
  if (!num && num !== 0) return 'N/A';
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

export default function MarketInfo({
  symbol,
  name,
  currentPrice,
  priceChange24h,
  high24h,
  low24h,
  volume24h,
  marketCap,
  liveTicker,
  freshness = 'stale',
  connectionStatus = 'disconnected',
}: MarketInfoProps) {
  // Prefer real-time data when available, fall back to REST snapshot
  const price = liveTicker?.price ?? currentPrice;
  const change = liveTicker?.priceChangePercent24h ?? priceChange24h;
  const high = liveTicker?.high24h ?? high24h;
  const low = liveTicker?.low24h ?? low24h;
  const vol = liveTicker?.volume24h ?? volume24h;

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Symbol & Price */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{symbol.toUpperCase()}/USDT</span>
              <span className="text-gray-400 text-sm">{name}</span>
              <PriceStalenessIndicator
                freshness={freshness}
                connectionStatus={connectionStatus}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-semibold ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? '+' : ''}{change?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-gray-800 hidden lg:block" />

        {/* Stats */}
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-400 block">24h High</span>
            <span className="text-white font-medium">${high?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-gray-400 block">24h Low</span>
            <span className="text-white font-medium">${low?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-gray-400 block">24h Volume</span>
            <span className="text-white font-medium">${formatLarge(vol)}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Market Cap</span>
            <span className="text-white font-medium">${formatLarge(marketCap)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
