'use client';

import React, { useState } from 'react';
import ProfileNav from '../ProfileNav';

// Categories for exploring
const categories = [
  { id: 'trending', name: 'Trending', icon: '🔥', count: 25 },
  { id: 'defi', name: 'DeFi', icon: '🏦', count: 142 },
  { id: 'gaming', name: 'Gaming', icon: '🎮', count: 89 },
  { id: 'layer1', name: 'Layer 1', icon: '🔷', count: 34 },
  { id: 'meme', name: 'Meme Coins', icon: '🐶', count: 156 },
  { id: 'nft', name: 'NFT', icon: '🖼️', count: 67 },
];

// Featured coins placeholder
const featuredCoins = [
  { name: 'Bitcoin', symbol: 'BTC', price: '$67,234.50', change: '+2.4%', positive: true, icon: '🟠' },
  { name: 'Ethereum', symbol: 'ETH', price: '$3,567.89', change: '+1.8%', positive: true, icon: '🔷' },
  { name: 'Solana', symbol: 'SOL', price: '$142.50', change: '-0.5%', positive: false, icon: '💜' },
  { name: 'Cardano', symbol: 'ADA', price: '$0.68', change: '+3.2%', positive: true, icon: '🔵' },
  { name: 'Polkadot', symbol: 'DOT', price: '$8.45', change: '+0.9%', positive: true, icon: '⚪' },
  { name: 'Avalanche', symbol: 'AVAX', price: '$45.20', change: '-1.2%', positive: false, icon: '🔺' },
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  selectedCategory === category.id
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-sm">{category.name}</span>
                <span className="text-xs opacity-60">{category.count} coins</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Coins */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Featured Coins</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 text-sm font-medium px-6 py-4">Name</th>
                    <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">Price</th>
                    <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">24h Change</th>
                    <th className="text-right text-gray-500 text-sm font-medium px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredCoins.map((coin, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{coin.icon}</span>
                          <div>
                            <p className="text-white font-medium">{coin.name}</p>
                            <p className="text-gray-500 text-sm">{coin.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-medium">
                        {coin.price}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        coin.positive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {coin.change}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition">
                          Add to Watchlist
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <a
            href="/markets"
            className="inline-flex items-center gap-2 text-emerald-400 font-medium hover:text-emerald-300 transition"
          >
            View all trending
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </ProfileNav>
  );
}
