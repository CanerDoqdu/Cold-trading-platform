'use client';

interface MarketInfoProps {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
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
}: MarketInfoProps) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-6">
        {/* Symbol & Price */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">{symbol.toUpperCase()}/USDT</span>
              <span className="text-gray-400 text-sm">{name}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-semibold ${priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h?.toFixed(2)}%
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
            <span className="text-white font-medium">${high24h?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-gray-400 block">24h Low</span>
            <span className="text-white font-medium">${low24h?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-gray-400 block">24h Volume</span>
            <span className="text-white font-medium">${formatLarge(volume24h)}</span>
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
