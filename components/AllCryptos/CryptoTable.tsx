'use client';

import { useEffect, useState, useCallback } from 'react';
import CryptoRow from './CryptoRow';
import PurpleSnakeAnimation from './PurpleSnakeAnimation';
import Tabs from './Tabs';
import { cachedFetch } from '@/lib/apiCache';
import { UseAuthContext } from '@/hooks/UseAuthContext';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

export default function CryptoTable() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const { state } = UseAuthContext();
  const { user } = state;

  // Fetch favorites from API or localStorage
  const fetchFavorites = useCallback(async () => {
    if (user) {
      try {
        const response = await fetch('/api/user/favorites');
        const data = await response.json();
        if (data.favorites) {
          setFavorites(new Set(data.favorites));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    } else {
      // Use localStorage for non-logged-in users
      const saved = localStorage.getItem('favorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const data = await cachedFetch(
          '/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=25&sparkline=false',
          {},
          120000 // 2 min cache
        );
        
        setCryptos(data);
      } catch (error) {
        console.error('Failed to fetch cryptos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (coinId: string) => {
    if (user) {
      // Save to database
      try {
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinId }),
        });
        const data = await response.json();
        if (response.ok) {
          setFavorites(new Set(data.favorites));
        }
      } catch (error) {
        console.error('Error updating favorite:', error);
      }
    } else {
      // Save to localStorage
      setFavorites((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(coinId)) {
          newSet.delete(coinId);
        } else {
          newSet.add(coinId);
        }
        localStorage.setItem('favorites', JSON.stringify(Array.from(newSet)));
        return newSet;
      });
    }
  };

  // Filter cryptos based on active tab
  const displayedCryptos = activeTab === 'favorites' 
    ? cryptos.filter(crypto => favorites.has(crypto.id))
    : cryptos;

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        favoritesCount={favorites.size}
      />
      
      <PurpleSnakeAnimation>
        <div className="rounded-xl border border-gray-900 bg-gray-950 overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between py-4 border-b border-gray-800 px-6 mb-2 bg-gray-900">
            <div className="flex-1 text-xs uppercase tracking-wide text-gray-500 font-medium">Name</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium">Price</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium">24h Change</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium">24h Volume</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium">Market Cap</div>
          </div>

          {/* Table Rows */}
          <div className="px-6">
            {displayedCryptos.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm">
                  {activeTab === 'favorites' 
                    ? 'No favorites yet. Click the star icon to add coins to your favorites.' 
                    : 'No cryptocurrencies found.'}
                </p>
              </div>
            ) : (
              displayedCryptos.map((crypto) => (
                <CryptoRow
                  key={crypto.id}
                  id={crypto.id}
                  symbol={crypto.symbol}
                  name={crypto.name}
                  image={crypto.image}
                  price={crypto.current_price}
                  change24h={crypto.price_change_percentage_24h}
                  volume24h={crypto.total_volume}
                  marketCap={crypto.market_cap}
                  isFavorite={favorites.has(crypto.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            )}
          </div>
        </div>
      </PurpleSnakeAnimation>
    </div>
  );
}
