'use client';

import React, { useState, useEffect } from 'react';
import ProfileNav from '../ProfileNav';
import Image from 'next/image';
import Link from 'next/link';

// Categories for exploring
const categories = [
  { id: 'trending', name: 'Trending', icon: '🔥', category: null },
  { id: 'defi', name: 'DeFi', icon: '🏦', category: 'decentralized-finance-defi' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', category: 'gaming' },
  { id: 'layer1', name: 'Layer 1', icon: '🔷', category: 'layer-1' },
  { id: 'meme', name: 'Meme', icon: '🐶', category: 'meme-token' },
  { id: 'nft', name: 'NFT', icon: '🖼️', category: 'non-fungible-tokens-nft' },
];

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
}

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = '/api/coingecko/markets?vs_currency=usd&per_page=20&sparkline=false';
        
        // If a category is selected (other than trending), add category filter
        const selectedCat = categories.find(c => c.id === selectedCategory);
        if (selectedCat?.category) {
          url += `&category=${selectedCat.category}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch coins');
        
        const data = await response.json();
        setCoins(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching coins:', err);
        setError('Failed to load coins. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [selectedCategory]);

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (value: number) => {
    if (value >= 1) return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '$' + value.toFixed(6);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return '$' + (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M';
    return '$' + value.toLocaleString();
  };

  return (
    <ProfileNav>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Explore
          </h1>
          <p className="text-gray-400 mt-1">
            Discover new cryptocurrencies and trending assets
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cryptocurrencies..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition"
          />
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedCategory === category.id
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Coins Table */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            {categories.find(c => c.id === selectedCategory)?.name || 'All'} Coins
          </h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">{error}</div>
            ) : filteredCoins.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No coins found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">#</th>
                      <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">Name</th>
                      <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">Price</th>
                      <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">24h Change</th>
                      <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">Market Cap</th>
                      <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoins.map((coin, index) => (
                      <tr
                        key={coin.id}
                        className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition"
                      >
                        <td className="px-6 py-4 text-gray-500">{coin.market_cap_rank || index + 1}</td>
                        <td className="px-6 py-4">
                          <Link href={`/markets/${coin.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                            <Image
                              src={coin.image}
                              alt={coin.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                            <div>
                              <p className="text-white font-medium">{coin.name}</p>
                              <p className="text-gray-500 text-sm uppercase">{coin.symbol}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right text-white font-medium">
                          {formatPrice(coin.current_price)}
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${
                          coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400">
                          {formatMarketCap(coin.market_cap)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/markets/${coin.id}`}
                            className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Trending Section */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔥</span>
            <h2 className="text-lg font-semibold text-white">What&apos;s Hot</h2>
          </div>
          <p className="text-gray-400 mb-4">
            These assets are trending in the last 24 hours based on trading volume and social mentions.
          </p>
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 text-emerald-400 font-medium hover:text-emerald-300 transition"
          >
            View all markets
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </ProfileNav>
  );
}