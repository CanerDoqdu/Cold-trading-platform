'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cachedFetch, apiCache } from '@/lib/apiCache';
import { useRecentViews } from '@/hooks/useRecentViews';

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    high_24h: {
      usd: number;
    };
    low_24h: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    market_cap: {
      usd: number;
    };
    market_cap_rank: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: {
      usd: number;
    };
    atl: {
      usd: number;
    };
  };
  description: {
    en: string;
  };
}

interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const ALLOWED_OHLC_DAYS = [1, 7, 14, 30, 90, 180, 365];
const normalizeOhlcDays = (days: number) => {
  for (const allowed of ALLOWED_OHLC_DAYS) {
    if (days <= allowed) return allowed;
  }
  return ALLOWED_OHLC_DAYS[ALLOWED_OHLC_DAYS.length - 1];
};

export default function CoinDetailPage({ coinId }: { coinId: string }) {
  const router = useRouter();
  const { addRecentView } = useRecentViews();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [chartData, setChartData] = useState<{prices: number[], dates: string[]}>({ prices: [], dates: [] });
  const [ohlcData, setOhlcData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; date: string; index: number; mouseY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0); // Which candle index is at the left edge
  const [visibleBars, setVisibleBars] = useState(80); // Number of candles to show (increased from 50)
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const daysMap = { '24h': 1, '7d': 7, '30d': 30 };
        const days = daysMap[timeRange];
        const chartDays = days * 3;
        const ohlcTargetDays = days === 1 ? 1 : days * 3;
        const ohlcDays = normalizeOhlcDays(ohlcTargetDays);
        
        let coinData: any = null;
        let trendingData: TrendingCoin[] = [];
        let rawChartData: { prices: [number, number][] } = { prices: [] };
        let rawOhlcData: number[][] = [];

        // STEP 1: Fetch coin data FIRST (critical) - show immediately
        try {
          coinData = await cachedFetch(
            `/api/coingecko/coin?id=${coinId}`,
            { signal: abortController.signal },
            600000 // 10 min cache - aggressive caching
          );
        } catch (err) {
          if ((err as any)?.name === 'AbortError' || err === 'route-change' || abortController.signal.aborted) {
            return;
          }
          console.error('❌ Coin fetch failed:', err);
          setError(true);
          setLoading(false);
          return;
        }

        if (!coinData || abortController.signal.aborted) {
          if (!abortController.signal.aborted) {
            setError(true);
            setLoading(false);
          }
          return;
        }

        // STEP 2: Show coin data immediately - don't wait for charts
        setCoin(coinData);
        setLoading(false);
        
        // Add to recent views
        if (coinData.id && coinData.name && coinData.symbol && coinData.image?.large) {
          addRecentView({
            id: coinData.id,
            name: coinData.name,
            symbol: coinData.symbol,
            image: coinData.image.large
          });
        }

        // STEP 3: Load trending (uses global cache, usually instant)
        try {
          trendingData = await cachedFetch(
            '/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=6&sparkline=false',
            { signal: abortController.signal },
            600000 // 10 min cache
          );
          if (!abortController.signal.aborted) {
            setTrending(Array.isArray(trendingData) ? trendingData : []);
          }
        } catch (err) {
          console.warn('⚠️ Trending fetch failed:', err);
        }

        // STEP 4: Load chart data in background
        if (abortController.signal.aborted) return;
        try {
          rawChartData = await cachedFetch(
            `/api/coingecko/market_chart?id=${coinId}&days=${chartDays}`,
            { signal: abortController.signal },
            600000 // 10 min cache
          );
        } catch (err) {
          console.warn('⚠️ Chart fetch failed:', err);
        }

        // STEP 5: Load OHLC data in background
        if (abortController.signal.aborted) return;
        try {
          rawOhlcData = await cachedFetch(
            `/api/coingecko/ohlc?id=${coinId}&days=${ohlcDays}`,
            { signal: abortController.signal },
            600000 // 10 min cache
          );
        } catch (err) {
          console.warn('⚠️ OHLC fetch failed:', err);
        }

        if (abortController.signal.aborted) return;
        
        // Process chart data
        if (rawChartData?.prices?.length > 0) {
          const prices = rawChartData.prices.map((p) => p[1]);
          const dates = rawChartData.prices.map((p) => {
            const date = new Date(p[0]);
            return timeRange === '24h' 
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
            close: item[4]
          }));
        } else if (rawChartData?.prices?.length > 0) {
          // Generate OHLC from price data
          const priceData = rawChartData.prices;
          const targetCandles = timeRange === '24h' ? 48 : timeRange === '7d' ? 140 : 150;
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
              close: prices[prices.length - 1]
            });
          }
        }
        
        if (!abortController.signal.aborted) {
          setOhlcData(processedOhlcData);
        }
        
      } catch (err) {
        if ((err as any)?.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }
        console.error('Failed to fetch coin detail:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      if (!abortController.signal.aborted) {
        abortController.abort('route-change');
      }
    };
  }, [coinId, timeRange]);

  // Handle wheel event with TradingView-like zoom behavior
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // TradingView style: All scroll is zoom by default (no Ctrl needed)
      // Scroll UP (negative deltaY) = Zoom IN (more bars visible)
      // Scroll DOWN (positive deltaY) = Zoom OUT (fewer bars visible)
      const zoomDelta = e.deltaY > 0 ? -8 : 8; // Increased sensitivity from 5 to 8
      const newVisibleBars = Math.max(5, Math.min(500, visibleBars + zoomDelta));
      
      setVisibleBars(newVisibleBars);
      
      // When zooming in, keep the chart centered on current scroll position
      const maxScroll = Math.max(0, (chartType === 'candle' ? ohlcData.length : chartData.prices.length) - newVisibleBars);
      setScrollOffset(prev => Math.max(0, Math.min(maxScroll, prev)));
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [visibleBars, ohlcData.length, chartData.prices.length, chartType]);

  // Reset scroll offset when time range changes
  useEffect(() => {
    setScrollOffset(0);
    setHoveredPoint(null);
  }, [timeRange]);

  // Canvas rendering effect - renders chart whenever data or scroll changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataLength = chartType === 'candle' ? ohlcData.length : chartData.prices.length;

    if (dataLength === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Get visible data range
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
    } else {
      const visiblePrices = chartData.prices.slice(visibleStart, visibleEnd);
      minPrice = Math.min(...visiblePrices);
      maxPrice = Math.max(...visiblePrices);
    }

    const priceRange = maxPrice - minPrice || 1;

    // Draw grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw candles or line
    const barWidth = chartWidth / (visibleEnd - visibleStart);
    const barSpacing = barWidth * 0.1;
    const candleWidth = barWidth - barSpacing;

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

        // Draw wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Draw body
        ctx.fillStyle = color;
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      });
    } else {
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

    // Draw crosshair and hover info
    if (hoveredPoint && !isDragging) {
      const normalizedX = hoveredPoint.x;
      // Vertical line
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(normalizedX, padding);
      ctx.lineTo(normalizedX, height - padding);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padding, hoveredPoint.mouseY);
      ctx.lineTo(width - padding, hoveredPoint.mouseY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw price labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const price = minPrice + (priceRange / 4) * i;
      const y = padding + chartHeight - (chartHeight / 4) * i;
      ctx.fillText(`$${price.toFixed(0)}`, width - padding + 10, y + 4);
    }
  }, [chartType, ohlcData, chartData, scrollOffset, visibleBars, hoveredPoint, isDragging]);

  const formatPrice = (value: number) => {
    if (value >= 1) return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return value.toFixed(8);
  };

  const formatLarge = (value: number) => {
    if (!value) return 'N/A';
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-gray-800 rounded-xl"></div>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 h-96 bg-gray-800 rounded-xl"></div>
              <div className="h-96 bg-gray-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="bg-black min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-6 text-center py-20">
          <p className="text-white text-xl mb-4">Failed to load coin data</p>
          <button onClick={() => router.push('/markets')} className="text-emerald-400 hover:text-emerald-300">
            ← Back to Markets
          </button>
        </div>
      </div>
    );
  }

  const description = coin.description?.en?.replace(/<[^>]*>/g, '') || '';
  const truncated = description.length > 280 ? description.slice(0, 280) + '...' : description;

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Subtle Back Link */}
        <button 
          onClick={() => router.push('/markets')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Markets
        </button>

        {/* TOP INFO BAR - Single horizontal row */}
        <div className="bg-gray-950 border border-gray-900 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Image src={coin.image.large} alt={coin.name} width={40} height={40} className="rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-white">{coin.symbol.toUpperCase()} / USD</h1>
                <p className="text-sm text-gray-500">{coin.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-gray-500 mb-1">Price</p>
                <p className="text-3xl font-bold text-white">${formatPrice(coin.market_data.current_price.usd)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">24h Change</p>
                <p className={`text-xl font-bold ${coin.market_data.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {coin.market_data.price_change_percentage_24h >= 0 ? '+' : ''}{coin.market_data.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">24h High</p>
                <p className="text-white font-medium">${formatPrice(coin.market_data.high_24h.usd)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">24h Low</p>
                <p className="text-white font-medium">${formatPrice(coin.market_data.low_24h.usd)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Volume</p>
                <p className="text-white font-medium">${formatLarge(coin.market_data.total_volume.usd)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                <p className="text-white font-medium">${formatLarge(coin.market_data.market_cap.usd)}</p>
              </div>
            </div>
          </div>

          {/* OHLC + Range + Moving Averages Row */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-8 text-xs">
            <div className="text-gray-500">Market data for {timeRange} period</div>
          </div>
        </div>

        {/* MAIN LAYOUT: Chart + Sidebar */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* CHART - Large centered card with line visualization */}
          <div className="col-span-2 bg-gray-950 border border-gray-900 rounded-xl p-6">
            {/* OHLC Data Bar - Dynamic with hover */}
            {chartData.prices.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 text-xs sm:text-sm">
                <div className="flex items-center gap-0.5">
                  <span className="text-gray-500">O</span>
                  <span className="text-white font-medium">{formatPrice(hoveredPoint ? chartData.prices[Math.max(0, hoveredPoint.index - 10)] : chartData.prices[0])}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-gray-500">H</span>
                  <span className="text-emerald-400 font-medium">{formatPrice(hoveredPoint 
                    ? Math.max(...chartData.prices.slice(Math.max(0, hoveredPoint.index - 10), hoveredPoint.index + 1))
                    : Math.max(...chartData.prices)
                  )}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-gray-500">L</span>
                  <span className="text-red-400 font-medium">{formatPrice(hoveredPoint 
                    ? Math.min(...chartData.prices.slice(Math.max(0, hoveredPoint.index - 10), hoveredPoint.index + 1))
                    : Math.min(...chartData.prices)
                  )}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-gray-500">C</span>
                  <span className="text-white font-medium">{formatPrice(hoveredPoint ? hoveredPoint.price : chartData.prices[chartData.prices.length - 1])}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-gray-500">CHG</span>
                  <span className={hoveredPoint 
                    ? (hoveredPoint.price >= chartData.prices[Math.max(0, hoveredPoint.index - 1)] ? 'text-emerald-400' : 'text-red-400')
                    : (coin.market_data.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400')
                  }>{hoveredPoint && hoveredPoint.index > 0
                      ? `${hoveredPoint.price >= chartData.prices[hoveredPoint.index - 1] ? '+' : ''}${((hoveredPoint.price - chartData.prices[hoveredPoint.index - 1]) / chartData.prices[hoveredPoint.index - 1] * 100).toFixed(2)}%`
                      : `${coin.market_data.price_change_percentage_24h >= 0 ? '+' : ''}${coin.market_data.price_change_percentage_24h.toFixed(2)}%`
                    }</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-gray-500">R</span>
                  <span className="text-emerald-400 font-medium">{((Math.max(...chartData.prices) - Math.min(...chartData.prices)) / Math.min(...chartData.prices) * 100).toFixed(2)}%</span>
                </div>
                {chartData.prices.length >= 7 && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-emerald-300 whitespace-nowrap">MA(7)</span>
                    <span className="text-white font-medium">{formatPrice(chartData.prices.slice(-7).reduce((a, b) => a + b, 0) / 7)}</span>
                  </div>
                )}
                {chartData.prices.length >= 25 && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-emerald-500 whitespace-nowrap">MA(25)</span>
                    <span className="text-white font-medium">{formatPrice(chartData.prices.slice(-25).reduce((a, b) => a + b, 0) / 25)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Time Range Selector */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h3 className="text-white font-semibold">Price Chart</h3>
                {/* Chart Type Toggle */}
                <div className="flex gap-1 bg-gray-900 rounded p-1">
                  <button
                    onClick={() => setChartType('candle')}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      chartType === 'candle'
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Candle
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      chartType === 'line'
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Line
                  </button>
                </div>
                {/* Zoom Controls */}
                <div className="flex gap-1 bg-gray-900 rounded p-1">
                  <button
                    onClick={() => setVisibleBars(prev => Math.max(5, prev - 10))}
                    className="px-2 py-1 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white rounded text-sm font-medium transition"
                    title="Zoom Out (-)"
                  >
                    −
                  </button>
                  <button
                    onClick={() => setVisibleBars(prev => Math.min(500, prev + 10))}
                    className="px-2 py-1 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white rounded text-sm font-medium transition"
                    title="Zoom In (+)"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                {(['24h', '7d', '30d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded text-sm font-medium transition ${
                      timeRange === range
                        ? 'bg-emerald-500 text-black font-bold'
                        : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="relative h-96 bg-gray-900/30 rounded-lg overflow-hidden">
              {(chartType === 'line' ? chartData.prices.length > 0 : ohlcData.length > 0) ? (
                <canvas 
                  ref={canvasRef}
                  width={800}
                  height={384}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    display: 'block'
                  }}
                  onPointerDown={(e) => {
                    setIsDragging(true);
                    setDragStart(e.clientX);
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (isDragging) {
                      const delta = e.clientX - dragStart;
                      const canvas = e.currentTarget;
                      const rect = canvas.getBoundingClientRect();
                      const dataLength = chartType === 'candle' ? ohlcData.length : chartData.prices.length;
                      
                      if (dataLength > 0) {
                        const barsToScroll = Math.round((delta / rect.width) * visibleBars * 0.5);
                        
                        setScrollOffset(prev => {
                          const visibleLimit = Math.min(visibleBars, dataLength);
                          const maxScroll = Math.max(0, dataLength - visibleLimit);
                          return Math.max(0, Math.min(maxScroll, prev - barsToScroll));
                        });
                      }
                      
                      setDragStart(e.clientX);
                      return;
                    }

                    // Hover logic for price and date display
                    const canvas = e.currentTarget;
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    const normalizedX = (mouseX / rect.width) * canvas.width;
                    
                    const dataLength = chartType === 'candle' ? ohlcData.length : chartData.prices.length;
                    if (dataLength === 0) return;
                    
                    const visibleEnd = Math.min(scrollOffset + visibleBars, dataLength);
                    const visibleStart = Math.max(0, visibleEnd - visibleBars);
                    const visibleCount = visibleEnd - visibleStart;
                    
                    const barWidth = (rect.width - 80) / visibleCount;
                    const hoverIndex = Math.floor((normalizedX - 40) / barWidth);
                    const actualIndex = scrollOffset + hoverIndex;
                    
                    if (actualIndex >= 0 && actualIndex < dataLength) {
                      const price = chartType === 'candle' ? ohlcData[actualIndex].close : chartData.prices[actualIndex];
                      const date = chartType === 'candle' 
                        ? new Date(ohlcData[actualIndex].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : chartData.dates[actualIndex];
                      
                      setHoveredPoint({
                        x: normalizedX,
                        y: 0,
                        price,
                        date,
                        index: actualIndex,
                        mouseY
                      });
                    }
                  }}
                  onPointerUp={(e) => {
                    setIsDragging(false);
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  }}
                  onPointerLeave={() => {
                    setHoveredPoint(null);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-red-400 text-lg mb-2">❌ No Chart Data</p>
                    <p className="text-gray-500 text-sm">Check browser console for errors</p>
                    <p className="text-gray-600 text-xs mt-2">chartData.prices.length = {chartData.prices.length}</p>
                  </div>
                </div>
              )}

              {/* Price labels - show visible range min/max */}
              {(chartType === 'line' ? chartData.prices.length > 0 : ohlcData.length > 0) && (
                <>
                  <div className="absolute top-0 right-0 text-right">
                    <p className="text-xs text-gray-500">High</p>
                    <p className="text-sm text-white font-medium">
                      ${formatPrice(
                        chartType === 'candle'
                          ? Math.max(...ohlcData.slice(scrollOffset, scrollOffset + visibleBars).flatMap(c => [c.high, c.low]))
                          : Math.max(...chartData.prices.slice(scrollOffset, scrollOffset + visibleBars))
                      )}
                    </p>
                  </div>
                  <div className="absolute bottom-0 right-0 text-right">
                    <p className="text-xs text-gray-500">Low</p>
                    <p className="text-sm text-white font-medium">
                      ${formatPrice(
                        chartType === 'candle'
                          ? Math.min(...ohlcData.slice(scrollOffset, scrollOffset + visibleBars).flatMap(c => [c.high, c.low]))
                          : Math.min(...chartData.prices.slice(scrollOffset, scrollOffset + visibleBars))
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* Hover price label on right side */}
              {hoveredPoint && (
                <>
                  {/* Price label at mouse Y position */}
                  <div 
                    className="absolute right-0 bg-emerald-500 text-black font-bold px-2 py-1 text-xs rounded-l"
                    style={{
                      top: `${(hoveredPoint.mouseY / 400) * 100}%`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    ${formatPrice(hoveredPoint.price)}
                  </div>

                  {/* Date label at mouse X position */}
                  <div 
                    className="absolute bottom-0 bg-gray-800 text-white px-2 py-1 text-xs font-medium rounded-t"
                    style={{
                      left: `${(hoveredPoint.x / 1000) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {hoveredPoint.date}
                  </div>
                </>
              )}
            </div>

            {/* Current Price Display */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">Current Price</p>
              <p className="text-4xl font-bold text-white">${formatPrice(coin.market_data.current_price.usd)}</p>
              <p className={`text-xl font-semibold mt-2 ${coin.market_data.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {coin.market_data.price_change_percentage_24h >= 0 ? '+' : ''}{coin.market_data.price_change_percentage_24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Top Coins */}
          <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">Top Coins</h3>
            <div className="space-y-2">
              {trending.length > 0 ? (
                trending.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => router.push(`/markets/${t.id}`)}
                    className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <Image src={t.image} alt={t.name} width={20} height={20} className="rounded-full" />
                      <div className="text-sm">
                        <p className="text-white font-medium">{t.symbol.toUpperCase()}</p>
                        <p className="text-gray-500 text-xs">${formatPrice(t.current_price)}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${t.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.price_change_percentage_24h >= 0 ? '+' : ''}{t.price_change_percentage_24h.toFixed(1)}%
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Loading top coins...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM PANELS */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Market Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-500">Rank</span>
                <span className="text-white font-medium">#{coin.market_data.market_cap_rank}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-500">ATH</span>
                <span className="text-white font-medium">${formatLarge(coin.market_data.ath.usd)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-500">Circulating</span>
                <span className="text-white font-medium">{formatLarge(coin.market_data.circulating_supply)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-500">Max Supply</span>
                <span className="text-white font-medium">{formatLarge(coin.market_data.max_supply)}</span>
              </div>
            </div>
          </div>

          {description && (
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">About {coin.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{showFullDescription ? description : truncated}</p>
              {description.length > 280 && (
                <button onClick={() => setShowFullDescription(!showFullDescription)} className="text-emerald-400 hover:text-emerald-300 text-sm mt-3">
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
