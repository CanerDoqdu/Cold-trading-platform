'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cachedFetch } from '@/lib/apiCache';

interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  market_cap_rank: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  atl: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
}

const formatPrice = (price: number) => {
  if (!price && price !== 0) return 'N/A';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
};

const formatLarge = (num: number) => {
  if (!num && num !== 0) return 'N/A';
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
};

export default function CoinDetailPageSimple({ coinId }: { coinId: string }) {
  const router = useRouter();
  const [coin, setCoin] = useState<MarketCoin | null>(null);
  const [allCoins, setAllCoins] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartData, setChartData] = useState<{ prices: number[]; dates: string[] } | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        // SINGLE API CALL - fetch top 100 coins with price changes
        const data = await cachedFetch(
          '/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false&price_change_percentage=7d,30d',
          {},
          600000 // 10 min cache
        );

        if (!Array.isArray(data)) {
          setError(true);
          setLoading(false);
          return;
        }

        setAllCoins(data);

        // Find the specific coin
        const foundCoin = data.find((c: MarketCoin) => c.id === coinId);
        
        if (foundCoin) {
          setCoin(foundCoin);
        } else {
          setError(true);
        }
        
        setLoading(false);

        // Load chart in background (optional, non-blocking)
        if (foundCoin) {
          loadChart(foundCoin.id);
        }
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError(true);
        setLoading(false);
      }
    };

    const loadChart = async (id: string) => {
      try {
        setChartLoading(true);
        const data = await cachedFetch(
          `/api/coingecko/market_chart?id=${id}&days=7`,
          {},
          600000 // 10 min cache
        );

        if (data?.prices && Array.isArray(data.prices)) {
          const prices = data.prices.map((p: [number, number]) => p[1]);
          const dates = data.prices.map((p: [number, number]) => {
            const date = new Date(p[0]);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          });
          setChartData({ prices, dates });
        }
        setChartLoading(false);
      } catch (err) {
        console.warn('Chart load failed:', err);
        setChartLoading(false);
      }
    };

    fetchData();
  }, [coinId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 w-32 bg-gray-800 rounded"></div>
                <div className="h-4 w-20 bg-gray-800 rounded"></div>
              </div>
              <div className="ml-auto">
                <div className="h-10 w-10 bg-gray-800 rounded-lg"></div>
              </div>
            </div>
            
            {/* Price section */}
            <div className="flex items-baseline gap-4">
              <div className="h-10 w-48 bg-gray-800 rounded"></div>
              <div className="h-6 w-24 bg-gray-800 rounded"></div>
            </div>
            
            {/* Chart */}
            <div className="h-64 bg-gray-800 rounded-xl"></div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-900 rounded-xl space-y-2">
                <div className="h-4 w-20 bg-gray-800 rounded"></div>
                <div className="h-6 w-24 bg-gray-800 rounded"></div>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl space-y-2">
                <div className="h-4 w-20 bg-gray-800 rounded"></div>
                <div className="h-6 w-24 bg-gray-800 rounded"></div>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl space-y-2">
                <div className="h-4 w-20 bg-gray-800 rounded"></div>
                <div className="h-6 w-24 bg-gray-800 rounded"></div>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl space-y-2">
                <div className="h-4 w-20 bg-gray-800 rounded"></div>
                <div className="h-6 w-24 bg-gray-800 rounded"></div>
              </div>
            </div>
            
            {/* Description section */}
            <div className="bg-gray-900 rounded-xl p-6 space-y-3">
              <div className="h-6 w-32 bg-gray-800 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-800 rounded"></div>
                <div className="h-4 w-full bg-gray-800 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Coin not found in top 100</p>
          <button
            onClick={() => router.push('/markets')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition mx-auto"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Markets
          </button>
        </div>
      </div>
    );
  }

  // Get top 6 coins for sidebar (excluding current coin)
  const topCoins = allCoins.filter(c => c.id !== coinId).slice(0, 6);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <button
          onClick={() => router.push('/markets')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Markets</span>
        </button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT - Coin Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coin Header */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <Image
                  src={coin.image}
                  alt={coin.name}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {coin.symbol.toUpperCase()} / USD
                  </h1>
                  <p className="text-gray-400">{coin.name}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-3xl font-bold text-white">
                    ${formatPrice(coin.current_price)}
                  </p>
                  <p className={`text-lg font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">24h High</p>
                  <p className="text-sm text-white font-medium">${formatPrice(coin.high_24h)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">24h Low</p>
                  <p className="text-sm text-white font-medium">${formatPrice(coin.low_24h)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Volume</p>
                  <p className="text-sm text-white font-medium">${formatLarge(coin.total_volume)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Market Cap</p>
                  <p className="text-sm text-white font-medium">${formatLarge(coin.market_cap)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Rank</p>
                  <p className="text-sm text-white font-medium">#{coin.market_cap_rank}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">ATH</p>
                  <p className="text-sm text-white font-medium">${formatLarge(coin.ath)}</p>
                </div>
              </div>
            </div>

            {/* Price Changes */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Price Changes</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-2">24 Hours</p>
                  <p className={`text-xl font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-2">7 Days</p>
                  <p className={`text-xl font-bold ${(coin.price_change_percentage_7d_in_currency || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(coin.price_change_percentage_7d_in_currency || 0) >= 0 ? '+' : ''}
                    {coin.price_change_percentage_7d_in_currency?.toFixed(2) || 'N/A'}%
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 mb-2">30 Days</p>
                  <p className={`text-xl font-bold ${(coin.price_change_percentage_30d_in_currency || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(coin.price_change_percentage_30d_in_currency || 0) >= 0 ? '+' : ''}
                    {coin.price_change_percentage_30d_in_currency?.toFixed(2) || 'N/A'}%
                  </p>
                </div>
              </div>
            </div>

            {/* Simple Price Chart */}
            {chartData && (
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">7-Day Price Chart</h3>
                <div className="h-64 flex items-end justify-between gap-1">
                  {chartData.prices.map((price, i) => {
                    const minPrice = Math.min(...chartData.prices);
                    const maxPrice = Math.max(...chartData.prices);
                    const range = maxPrice - minPrice || 1;
                    const heightPercent = ((price - minPrice) / range) * 100;
                    const isPositive = price >= chartData.prices[0];

                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t ${isPositive ? 'bg-green-500' : 'bg-red-500'} hover:opacity-80 transition`}
                        style={{ height: `${Math.max(heightPercent, 5)}%`, minHeight: '4px' }}
                        title={`${chartData.dates[i]}: $${formatPrice(price)}`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <span>{chartData.dates[0]}</span>
                  <span>${formatPrice(chartData.prices[0])}</span>
                  <span>${formatPrice(Math.max(...chartData.prices))}</span>
                  <span>{chartData.dates[chartData.dates.length - 1]}</span>
                </div>
              </div>
            )}
            {chartLoading && (
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">7-Day Price Chart</h3>
                <div className="h-64 bg-gray-900 rounded animate-pulse"></div>
              </div>
            )}

            {/* Market Stats */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Market Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-500">Market Cap Rank</span>
                  <span className="text-white font-medium">#{coin.market_cap_rank}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-500">Market Cap</span>
                  <span className="text-white font-medium">${formatLarge(coin.market_cap)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-500">24h Volume</span>
                  <span className="text-white font-medium">${formatLarge(coin.total_volume)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-500">All Time High</span>
                  <span className="text-white font-medium">${formatLarge(coin.ath)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-500">Circulating Supply</span>
                  <span className="text-white font-medium">{formatLarge(coin.circulating_supply)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-800">
                  <span className="text-gray-500">Max Supply</span>
                  <span className="text-white font-medium">{formatLarge(coin.max_supply)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Top Coins Sidebar */}
          <div className="bg-gray-950 border border-gray-900 rounded-xl p-6 h-fit">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Top Coins</h3>
            <div className="space-y-2">
              {topCoins.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/markets/${t.id}`)}
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <Image src={t.image} alt={t.name} width={24} height={24} className="rounded-full" />
                    <div>
                      <p className="text-white font-medium text-sm">{t.symbol.toUpperCase()}</p>
                      <p className="text-gray-500 text-xs">${formatPrice(t.current_price)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${t.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.price_change_percentage_24h >= 0 ? '+' : ''}{t.price_change_percentage_24h?.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
