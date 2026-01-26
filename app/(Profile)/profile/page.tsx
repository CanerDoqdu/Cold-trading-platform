'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileNav from './ProfileNav';
import { UseAuthContext } from '@/hooks/UseAuthContext';
import { StarIcon } from '@heroicons/react/24/solid';

interface FavoriteCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function ProfilePage() {
  const { state } = UseAuthContext();
  const { user } = state;
  const [favorites, setFavorites] = useState<FavoriteCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const displayName = user?.name || 'Guest User';

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        setFavorites([]);
        return;
      }

      try {
        // First get favorite IDs
        const favResponse = await fetch('/api/user/favorites');
        const favData = await favResponse.json();
        
        if (favData.favorites && favData.favorites.length > 0) {
          // Fetch coin data for favorites
          const coinIds = favData.favorites.join(',');
          const coinResponse = await fetch(
            `/api/coingecko/markets?vs_currency=usd&ids=${coinIds}&sparkline=false`
          );
          const coinData = await coinResponse.json();
          // Make sure coinData is an array
          if (Array.isArray(coinData)) {
            setFavorites(coinData);
          } else {
            setFavorites([]);
          }
        } else {
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const removeFavorite = async (coinId: string) => {
    try {
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinId }),
      });
      
      if (response.ok) {
        setFavorites(prev => prev.filter(coin => coin.id !== coinId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const formatPrice = (value: number) => {
    if (value >= 1) return '$' + value.toFixed(2);
    return '$' + value.toFixed(6);
  };

  return (
    <ProfileNav>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-black">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome, {displayName}
            </h1>
            <p className="text-gray-400 mt-1">
              Track your favorite cryptocurrencies and manage your portfolio
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Favorites</p>
                <p className="text-white text-2xl font-bold mt-1">{favorites.length}</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Portfolio Value</p>
                <p className="text-white text-2xl font-bold mt-1">Coming Soon</p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Recent Views</p>
                <p className="text-white text-2xl font-bold mt-1">Coming Soon</p>
              </div>
              <span className="text-3xl">👁️</span>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <StarIcon className="w-5 h-5 text-yellow-400" />
              My Favorites
            </h2>
            <Link 
              href="/markets" 
              className="text-sm text-emerald-400 hover:text-emerald-300 transition"
            >
              View All Markets →
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !user ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-4">Please log in to see your favorites</p>
              <Link 
                href="/login" 
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Log In
              </Link>
            </div>
          ) : favorites.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t added any favorites yet</p>
              <Link 
                href="/markets" 
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Explore Markets
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((coin) => (
                <Link
                  key={coin.id}
                  href={`/markets/${coin.id}`}
                  className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                    <div>
                      <p className="text-white font-medium">{coin.name}</p>
                      <p className="text-gray-500 text-sm uppercase">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white font-medium">{formatPrice(coin.current_price)}</p>
                      <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFavorite(coin.id);
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      title="Remove from favorites"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/markets"
            className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Explore Markets</h3>
              <p className="text-gray-500 text-sm">Browse all cryptocurrencies</p>
            </div>
          </Link>

          <Link
            href="/nftrankings"
            className="flex items-center gap-4 bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">NFT Rankings</h3>
              <p className="text-gray-500 text-sm">View top NFT collections</p>
            </div>
          </Link>
        </div>
      </div>
    </ProfileNav>
  );
}
