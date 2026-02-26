'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cachedFetch } from '@/lib/apiCache';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface CoinSearchListProps {
  currentSymbol: string;
}

export default function CoinSearchList({ currentSymbol }: CoinSearchListProps) {
  const router = useRouter();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await cachedFetch(
          '/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=false',
          {},
          300000 // 5 min cache
        );
        setCoins(data);
        setFilteredCoins(data);
      } catch (err) {
        console.error('Failed to fetch coins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCoins(coins);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query)
    );
    setFilteredCoins(filtered);
  }, [searchQuery, coins]);

  const handleSelectCoin = (symbol: string) => {
    router.push(`/trade/${symbol.toLowerCase()}`);
  };

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white mb-2">Markets</h3>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search coin..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Column Headers */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400 border-b border-gray-800">
        <span className="flex-1">Pair</span>
        <span className="w-24 text-right">Price</span>
        <span className="w-16 text-right">24h%</span>
      </div>

      {/* Coin List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredCoins.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No coins found
          </div>
        ) : (
          filteredCoins.map((coin) => (
            <button
              key={coin.id}
              onClick={() => handleSelectCoin(coin.symbol)}
              className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800 transition-colors ${
                coin.symbol.toLowerCase() === currentSymbol.toLowerCase()
                  ? 'bg-gray-800/50 border-l-2 border-emerald-500'
                  : ''
              }`}
            >
              <div className="flex-1 text-left">
                <span className="text-white font-medium text-sm">
                  {coin.symbol.toUpperCase()}
                </span>
                <span className="text-gray-400 text-xs">/USDT</span>
              </div>
              <div className="w-24 text-right">
                <span className="text-white text-sm">
                  ${coin.current_price >= 1 
                    ? coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : coin.current_price.toFixed(6)
                  }
                </span>
              </div>
              <div className="w-16 text-right">
                <span className={`text-sm font-medium ${
                  coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
