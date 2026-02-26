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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Crypto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const searchRes = await fetch(`/api/coingecko/search?query=${encodeURIComponent(normalizedQuery)}`);
        const searchData = await searchRes.json();

        const coinIds = (searchData?.coins || [])
          .slice(0, 25)
          .map((coin: any) => coin.id)
          .filter(Boolean);

        if (!coinIds.length) {
          if (!isCancelled) {
            setSearchResults([]);
          }
          return;
        }

        const marketsData = await cachedFetch(
          `/api/coingecko/markets?vs_currency=usd&ids=${coinIds.join(',')}&sparkline=false`,
          {},
          120000
        );

        if (!isCancelled) {
          setSearchResults(Array.isArray(marketsData) ? marketsData : []);
        }
      } catch (error) {
        if (!isCancelled) {
          setSearchResults([]);
        }
        console.error('Search failed:', error);
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sourceCryptos = normalizedQuery ? searchResults : cryptos;
  const displayedCryptos = activeTab === 'favorites'
    ? sourceCryptos.filter(crypto => favorites.has(crypto.id))
    : sourceCryptos;

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Tabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          favoritesCount={favorites.size}
        />

        <div className="relative w-full md:w-[320px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coins (e.g., sei, bitcoin)"
            className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            aria-label="Search coins"
          />
          {isSearching && (
            <span className="absolute right-9 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Searching...
            </span>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <PurpleSnakeAnimation>
        <div className="rounded-xl border border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-950 overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between py-3 md:py-4 border-b border-gray-200 dark:border-gray-800 px-3 md:px-6 mb-2 bg-gray-100 dark:bg-gray-900">
            <div className="flex-1 text-xs uppercase tracking-wide text-gray-500 font-medium">Name</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium">Price</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium hidden sm:block">24h Change</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium hidden md:block">24h Volume</div>
            <div className="flex-1 text-right text-xs uppercase tracking-wide text-gray-500 font-medium hidden lg:block">Market Cap</div>
          </div>

          {/* Table Rows */}
          <div className="px-3 md:px-6">
            {displayedCryptos.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-sm">
                  {activeTab === 'favorites' && !normalizedQuery
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
