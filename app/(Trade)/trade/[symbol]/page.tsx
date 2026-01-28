'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { cachedFetch } from '@/lib/apiCache';
import BuySellPanel from '@/components/Trade/BuySellPanel';
import CoinSearchList from '@/components/Trade/CoinSearchList';
import OrderBook from '@/components/Trade/OrderBook';
import RecentTrades from '@/components/Trade/RecentTrades';
import MarketInfo from '@/components/Trade/MarketInfo';
import Link from 'next/link';
import { usePriceAlerts } from '@/hooks/useNotifications';
import { UseAuthContext } from '@/hooks/UseAuthContext';

// TradingView widget'ı client-side only olarak yükle
const TradingViewWidget = dynamic(
  () => import('@/components/Trade/TradingViewWidget'),
  { ssr: false, loading: () => <div className="h-full bg-gray-900 animate-pulse rounded-xl" /> }
);

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
}

export default function TradeSymbolPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toLowerCase() || 'btc';
  const { state } = UseAuthContext();
  const { user } = state;
  const { createAlert } = usePriceAlerts();
  
  const [coin, setCoin] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        setLoading(true);
        setError(false);

        const data = await cachedFetch(
          '/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=false',
          {},
          300000 // 5 min cache to avoid rate limits
        );

        const foundCoin = data.find(
          (c: CoinData) => c.symbol.toLowerCase() === symbol.toLowerCase()
        );

        if (foundCoin) {
          setCoin(foundCoin);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch coin:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
    // Removed auto-refresh interval to avoid rate limits
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-4">
        <div className="max-w-[1920px] mx-auto space-y-4">
          <div className="h-16 bg-gray-200 dark:bg-gray-900 rounded-xl animate-pulse" />
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-2 h-[600px] bg-gray-200 dark:bg-gray-900 rounded-xl animate-pulse" />
            <div className="col-span-7 h-[600px] bg-gray-200 dark:bg-gray-900 rounded-xl animate-pulse" />
            <div className="col-span-3 h-[600px] bg-gray-200 dark:bg-gray-900 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">
            Coin &quot;{symbol.toUpperCase()}&quot; not found
          </p>
          <Link
            href="/trade/btc"
            className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition"
          >
            Go to BTC
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950">
        <div className="max-w-[1920px] mx-auto px-3 md:px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/Group.svg" alt="COLD" className="w-6 md:w-7 h-6 md:h-7" />
            <span className="text-white font-semibold text-base md:text-lg">COLD</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/markets" className="text-gray-400 hover:text-white transition text-xs md:text-sm">
              Markets
            </Link>
            <Link href="/trade/btc" className="text-emerald-400 font-medium text-xs md:text-sm">
              Trade
            </Link>
            <Link href="/profile/portfolio" className="text-gray-400 hover:text-white transition text-xs md:text-sm hidden sm:block">
              Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto p-2 md:p-4 space-y-3 md:space-y-4">
        {/* Market Info Bar */}
        <MarketInfo
          symbol={coin.symbol}
          name={coin.name}
          currentPrice={coin.current_price}
          priceChange24h={coin.price_change_percentage_24h}
          high24h={coin.high_24h}
          low24h={coin.low_24h}
          volume24h={coin.total_volume}
          marketCap={coin.market_cap}
        />

        {/* Alert Button */}
        {user && (
          <div className="flex justify-end">
            <button
              onClick={() => setShowAlertModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Set Price Alert
            </button>
          </div>
        )}

        {/* Main Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
          {/* Left Column - Buy/Sell Panel */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <BuySellPanel
              symbol={coin.symbol}
              name={coin.name}
              currentPrice={coin.current_price}
              coinId={coin.id}
            />
          </div>

          {/* Center Column - Chart + Order Book + Trades */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-3 md:space-y-4">
            {/* TradingView Chart */}
            <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden h-[300px] sm:h-[400px] md:h-[500px]">
              <TradingViewWidget symbol={coin.symbol} />
            </div>

            {/* Order Book & Recent Trades */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <OrderBook currentPrice={coin.current_price} symbol={coin.symbol.toUpperCase()} />
              <RecentTrades currentPrice={coin.current_price} symbol={coin.symbol.toUpperCase()} />
            </div>
          </div>

          {/* Right Column - Coin Search List */}
          <div className="lg:col-span-3 order-3 h-[400px] lg:h-[700px]">
            <CoinSearchList currentSymbol={coin.symbol} />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-6 text-xs text-gray-400">
            <span>💡 This is a demo trading interface. No real transactions are processed.</span>
            <span>📊 Chart powered by TradingView</span>
            <span>🔄 Prices cached for 5 minutes</span>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Set Price Alert</h3>
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setAlertMessage(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6 p-3 bg-gray-800 rounded-lg">
              {coin.image && (
                <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
              )}
              <div>
                <p className="font-semibold">{coin.name}</p>
                <p className="text-sm text-gray-400">
                  Current: ${coin.current_price?.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Alert when price goes</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAlertCondition('above')}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      alertCondition === 'above'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Above ↑
                  </button>
                  <button
                    onClick={() => setAlertCondition('below')}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      alertCondition === 'below'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Below ↓
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Price (USD)</label>
                <input
                  type="number"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  placeholder="Enter target price"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              {alertMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    alertMessage.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {alertMessage.text}
                </div>
              )}

              <button
                onClick={handleCreateAlert}
                disabled={alertLoading || !alertPrice}
                className="w-full py-3 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition disabled:opacity-50"
              >
                {alertLoading ? 'Creating...' : 'Create Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
