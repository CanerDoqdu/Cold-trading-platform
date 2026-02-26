'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cachedFetch } from '@/lib/apiCache';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { usePriceAlerts } from '@/hooks/useNotifications';
import { UseAuthContext } from '@/hooks/UseAuthContext';

interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  ath: number;
  circulating_supply: number;
  max_supply: number;
}

interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

type ChartType = 'candle' | 'line';
type TimeRange = '24h' | '7d' | '30d';

interface ChartDataType {
  prices: number[];
  dates: string[];
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

export default function CoinDetailPageAdvanced({ coinId }: { coinId: string }) {
  const { state } = UseAuthContext();
  const { user } = state;
  const { createAlert } = usePriceAlerts();
  
  const [coin, setCoin] = useState<MarketCoin | null>(null);
  const [allCoins, setAllCoins] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Chart state
  const [chartData, setChartData] = useState<ChartDataType | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [chartType, setChartType] = useState<ChartType>('candle');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [visibleBars, setVisibleBars] = useState(100);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const abortControllerRef = useRef<AbortController>(new AbortController());

  const handleCreateAlert = async () => {
    if (!coin || !alertPrice) return;
    
    setAlertLoading(true);
    setAlertMessage(null);
    
    const result = await createAlert({
      coinId: coin.id,
      coinSymbol: coin.symbol,
      coinName: coin.name,
      coinImage: coin.image,
      targetPrice: parseFloat(alertPrice),
      condition: alertCondition,
      currentPrice: coin.current_price
    });
    
    setAlertLoading(false);
    
    if (result.success) {
      setAlertMessage({ type: 'success', text: result.message || 'Alert created!' });
      setTimeout(() => {
        setShowAlertModal(false);
        setAlertMessage(null);
        setAlertPrice('');
      }, 2000);
    } else {
      setAlertMessage({ type: 'error', text: result.error || 'Failed to create alert' });
    }
  };

  // Fetch coin data from markets endpoint (instant)
  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        setLoading(true);
        setError(false);

        // STEP 1: Get coin from markets endpoint (top 100 coins)
        const data = await cachedFetch(
          '/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false&price_change_percentage=7d,30d',
          { signal: abortControllerRef.current.signal },
          600000 // 10 min cache
        );

        if (!Array.isArray(data)) {
          setError(true);
          setLoading(false);
          return;
        }

        setAllCoins(data);
        const foundCoin = data.find((c: MarketCoin) => c.id === coinId);
        
        if (!foundCoin) {
          setError(true);
          setLoading(false);
          return;
        }

        setCoin(foundCoin);
        setLoading(false);

        // STEP 2: Load chart data in background
        loadChartData(foundCoin.id, timeRange);
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          console.error('Failed to fetch coin:', err);
          setError(true);
          setLoading(false);
        }
      }
    };

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
    };
  }, [coinId]);

  // Load chart when time range changes
  useEffect(() => {
    if (coin) {
      loadChartData(coin.id, timeRange);
    }
  }, [timeRange, coin?.id]);

  const normalizeOhlcDays = (days: number) => {
    const valid = [1, 7, 14, 30, 90, 180, 365];
    return valid.reduce((prev, curr) =>
      Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
    );
  };

  const loadChartData = async (id: string, range: TimeRange) => {
    if (abortControllerRef.current?.signal.aborted) return;

    try {
      setChartLoading(true);
      const daysMap = { '24h': 1, '7d': 7, '30d': 30 };
      const days = daysMap[range];
      const chartDays = days * 3;
      const ohlcTargetDays = days === 1 ? 1 : days * 3;
      const ohlcDays = normalizeOhlcDays(ohlcTargetDays);

      let rawChartData: { prices: [number, number][] } = { prices: [] };
      let rawOhlcData: number[][] = [];

      // Fetch chart data
      try {
        rawChartData = await cachedFetch(
          `/api/coingecko/market_chart?id=${id}&days=${chartDays}`,
          { signal: abortControllerRef.current?.signal },
          600000
        );
      } catch (err) {
        console.warn('⚠️ Chart fetch failed:', err);
      }

      // Fetch OHLC data
      try {
        rawOhlcData = await cachedFetch(
          `/api/coingecko/ohlc?id=${id}&days=${ohlcDays}`,
          { signal: abortControllerRef.current?.signal },
          600000
        );
      } catch (err) {
        console.warn('⚠️ OHLC fetch failed:', err);
      }

      if (abortControllerRef.current?.signal.aborted) return;

      // Process chart data
      if (rawChartData?.prices?.length > 0) {
        const prices = rawChartData.prices.map((p) => p[1]);
        const dates = rawChartData.prices.map((p) => {
          const date = new Date(p[0]);
          return range === '24h'
            ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        setChartData({ prices, dates });
      }

      // Process OHLC data
      let processedOhlcData: OHLCData[] = [];

      if (rawOhlcData?.length >= 10) {
        processedOhlcData = rawOhlcData.map((item) => ({
          timestamp: item[0],
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
        }));
      } else if (rawChartData?.prices?.length > 0) {
        // Generate OHLC from price data
        const priceData = rawChartData.prices;
        const targetCandles = range === '24h' ? 48 : range === '7d' ? 140 : 150;
        const candleSize = Math.max(1, Math.floor(priceData.length / targetCandles));

        for (let i = 0; i < priceData.length; i += candleSize) {
          const chunk = priceData.slice(i, i + candleSize);
          const prices = chunk.map((p) => p[1]);
          const timestamp = chunk[chunk.length - 1][0];

          processedOhlcData.push({
            timestamp,
            open: prices[0],
            high: Math.max(...prices),
            low: Math.min(...prices),
            close: prices[prices.length - 1],
          });
        }
      }

      if (!abortControllerRef.current?.signal.aborted) {
        setOhlcData(processedOhlcData);
        setScrollOffset(0);
        setChartLoading(false);
      }
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        console.error('Failed to load chart:', err);
        setChartLoading(false);
      }
    }
  };

  // Zoom with scroll wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomDelta = e.deltaY > 0 ? -8 : 8;
      const newVisibleBars = Math.max(5, Math.min(500, visibleBars + zoomDelta));

      setVisibleBars(newVisibleBars);

      const maxScroll = Math.max(
        0,
        (chartType === 'candle' ? ohlcData.length : chartData?.prices.length || 0) - newVisibleBars
      );
      setScrollOffset((prev) => Math.max(0, Math.min(maxScroll, prev)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [visibleBars, ohlcData.length, chartData?.prices.length, chartType]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (!chartData && ohlcData.length === 0)) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataLength = chartType === 'candle' ? ohlcData.length : chartData?.prices.length || 0;
    if (dataLength === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Get visible data
    const visibleEnd = Math.min(scrollOffset + visibleBars, dataLength);
    const visibleStart = Math.max(0, visibleEnd - visibleBars);

    if (visibleEnd - visibleStart === 0) return;

    // Calculate price range
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    if (chartType === 'candle') {
      const visibleCandles = ohlcData.slice(visibleStart, visibleEnd);
      visibleCandles.forEach((candle) => {
        minPrice = Math.min(minPrice, candle.low);
        maxPrice = Math.max(maxPrice, candle.high);
      });
    } else if (chartData) {
      const visiblePrices = chartData.prices.slice(visibleStart, visibleEnd);
      minPrice = Math.min(...visiblePrices);
      maxPrice = Math.max(...visiblePrices);
    }

    const priceRange = maxPrice - minPrice || 1;
    const barWidth = chartWidth / (visibleEnd - visibleStart);
    const barSpacing = barWidth * 0.1;
    const candleWidth = barWidth - barSpacing;

    // Draw candles
    if (chartType === 'candle') {
      const visibleCandles = ohlcData.slice(visibleStart, visibleEnd);
      visibleCandles.forEach((candle, i) => {
        const x = padding + i * barWidth + barWidth / 2;
        const yHigh = padding + chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
        const yLow = padding + chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;
        const yOpen = padding + chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
        const yClose = padding + chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;

        const isGreen = candle.close >= candle.open;
        const color = isGreen ? '#10b981' : '#ef4444';

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else if (chartData) {
      // Line chart
      const visiblePrices = chartData.prices.slice(visibleStart, visibleEnd);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();

      visiblePrices.forEach((price, i) => {
        const x = padding + i * barWidth + barWidth / 2;
        const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }
  }, [chartData, ohlcData, scrollOffset, visibleBars, chartType]);

  // Mouse move for scrolling and hover
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startScrollOffset = scrollOffset;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentX = moveEvent.clientX - rect.left;
      const delta = (startX - currentX) / 10;
      const maxScroll = Math.max(
        0,
        (chartType === 'candle' ? ohlcData.length : chartData?.prices.length || 0) - visibleBars
      );
      setScrollOffset(Math.max(0, Math.min(maxScroll, startScrollOffset + delta)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-400 text-lg">Coin not found</div>
      </div>
    );
  }

  const priceChange24h = coin.price_change_percentage_24h || 0;
  const priceChange7d = coin.price_change_percentage_7d_in_currency || 0;
  const priceChange30d = coin.price_change_percentage_30d_in_currency || 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={coin.image} alt={coin.name} className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-bold">{coin.name}</h1>
              <p className="text-gray-400">{coin.symbol.toUpperCase()}</p>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Set Alert Button */}
            {user && (
              <button
                onClick={() => {
                  setAlertPrice(coin.current_price.toString());
                  setShowAlertModal(true);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 font-medium rounded-lg transition-all border border-yellow-600/30"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Set Alert
              </button>
            )}
            {/* Trade Button */}
            <Link
              href={`/trade/${coin.symbol.toLowerCase()}`}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-emerald-500/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Trade {coin.symbol.toUpperCase()}
            </Link>
          </div>
        </div>

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Set Price Alert</h3>
                <button
                  onClick={() => {
                    setShowAlertModal(false);
                    setAlertMessage(null);
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <img src={coin.image} alt={coin.name} className="w-10 h-10" />
                <div>
                  <p className="text-white font-medium">{coin.name}</p>
                  <p className="text-gray-400 text-sm">Current: ${formatPrice(coin.current_price)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Condition Select */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Alert when price goes</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAlertCondition('above')}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        alertCondition === 'above'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      ↑ Above
                    </button>
                    <button
                      onClick={() => setAlertCondition('below')}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        alertCondition === 'below'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      ↓ Below
                    </button>
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input
                      type="number"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Message */}
                {alertMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    alertMessage.type === 'success' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {alertMessage.text}
                  </div>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreateAlert}
                  disabled={alertLoading || !alertPrice}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {alertLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Create Alert
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Price and changes */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="text-4xl font-bold mb-4">${formatPrice(coin.current_price)}</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400">24h Change</p>
              <p className={priceChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-400">7d Change</p>
              <p className={priceChange7d >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {priceChange7d >= 0 ? '+' : ''}{priceChange7d.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-400">30d Change</p>
              <p className={priceChange30d >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {priceChange30d >= 0 ? '+' : ''}{priceChange30d.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Market Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-gray-400">Market Cap</p>
            <p className="text-2xl font-bold">${formatLarge(coin.market_cap)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-gray-400">Total Volume</p>
            <p className="text-2xl font-bold">${formatLarge(coin.total_volume)}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-gray-400">Rank</p>
            <p className="text-2xl font-bold">#{coin.market_cap_rank}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-gray-400">All Time High</p>
            <p className="text-2xl font-bold">${formatPrice(coin.ath)}</p>
          </div>
        </div>

        {/* Supply Info */}
        {(coin.circulating_supply || coin.max_supply) && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <p className="text-gray-400 mb-2">Supply</p>
            {coin.circulating_supply && (
              <p className="text-sm">Circulating: {formatLarge(coin.circulating_supply)}</p>
            )}
            {coin.max_supply && (
              <p className="text-sm">Max: {formatLarge(coin.max_supply)}</p>
            )}
          </div>
        )}
      </div>

      {/* Chart Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Price Chart</h2>
            <div className="flex gap-2">
              {/* Time Range Buttons */}
              {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded ${
                    timeRange === range ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  {range}
                </button>
              ))}

              {/* Chart Type Toggle */}
              <div className="ml-4 border-l border-gray-600 pl-4">
                <button
                  onClick={() => setChartType(chartType === 'candle' ? 'line' : 'candle')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
                >
                  {chartType === 'candle' ? 'Candle' : 'Line'}
                </button>
              </div>
            </div>
          </div>

          {chartLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-gray-400">Loading chart...</div>
            </div>
          ) : ohlcData.length > 0 || chartData ? (
            <>
              <canvas
                ref={canvasRef}
                width={1000}
                height={400}
                className="w-full border border-slate-700 rounded cursor-grab active:cursor-grabbing"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredPoint({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <div className="text-gray-400 text-sm mt-2">
                Scroll to zoom • Drag to pan • Visible bars: {visibleBars}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-96">
              <div className="text-gray-400">No chart data available</div>
            </div>
          )}
        </div>
      </div>

      {/* Top Coins List */}
      {allCoins.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Top Coins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allCoins.slice(0, 10).map((c) => (
              <Link
                key={c.id}
                href={`/markets/${c.id}`}
                className={`bg-slate-800 rounded-lg p-4 hover:bg-slate-700 transition ${
                  c.id === coin.id ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img src={c.image} alt={c.name} className="w-6 h-6" />
                  <span className="font-bold">{c.name}</span>
                </div>
                <div className="text-sm text-gray-400">
                  ${formatPrice(c.current_price)} •{' '}
                  <span className={c.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {c.price_change_percentage_24h >= 0 ? '+' : ''}
                    {c.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
