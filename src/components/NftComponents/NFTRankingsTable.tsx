'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import NeonSnakeAnimation from '@/components/NftComponents/NeonSnakeAnimation';

interface NFTCollection {
  id?: string;
  name: string;
  image?: string;
  chain?: string;
  floorPrice?: number;
  floorPriceToken?: string;
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  rank?: number;
  _id?: string;
}

interface CombinedNFTData {
  collection: any;
  stats: any;
}

interface NFTRankingsTableProps {
  initialData: (NFTCollection | CombinedNFTData)[];
}

export default function NFTRankingsTable({ initialData }: NFTRankingsTableProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const nextOffset = data.length;
      const res = await fetch(`/api/nft-rankings?offset=${nextOffset}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch');
      const moreData = await res.json();
      
      if (moreData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...moreData]);
      }
    } catch (error) {
      console.error('Failed to load more NFTs:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    if (price >= 1000000000) return `$${(price / 1000000000).toFixed(2)}B`;
    if (price >= 1000000) return `$${(price / 1000000).toFixed(2)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(2)}K`;
    return `$${price.toFixed(2)}`;
  };

  const formatFloorPrice = (price?: number) => {
    if (!price) return '-';
    return price.toFixed(2);
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-300';
    return change >= 0 ? 'text-emerald-400' : 'text-red-400';
  };

  const getChainBadgeColor = (chain?: string) => {
    const chainLower = chain?.toLowerCase() || '';
    if (chainLower.includes('ethereum') || chainLower.includes('eth')) return 'bg-blue-500/20 text-blue-300';
    if (chainLower.includes('solana') || chainLower.includes('sol')) return 'bg-purple-500/20 text-purple-300';
    if (chainLower.includes('polygon')) return 'bg-pink-500/20 text-pink-300';
    if (chainLower.includes('optimism')) return 'bg-red-500/20 text-red-300';
    if (chainLower.includes('arbitrum')) return 'bg-cyan-500/20 text-cyan-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  return (
    <NeonSnakeAnimation>
      <div className="space-y-1 sm:space-y-2 overflow-x-auto">
        {/* Table Header */}
        <div className="hidden lg:grid gap-4 px-6 py-4 bg-gray-900/50 border-b border-white/10 sticky top-0 z-10 min-w-[900px]" style={{ gridTemplateColumns: '60px 30px 1fr 140px 110px 140px 140px' }}>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Rank
          </div>
        <div></div>
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">Collection</div>
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider text-right">Floor Price</div>
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider text-right">24h Change</div>
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider text-right">24h Volume</div>
        <div className="text-xs font-bold text-gray-300 uppercase tracking-wider text-right">Market Cap</div>
      </div>

      {/* Table Rows - Desktop only */}
      <div className="hidden lg:block space-y-1">
        {data.map((item, index) => {
          // Handle both combined data and plain collection formats
          const itemData = (item as CombinedNFTData).collection ? (item as CombinedNFTData) : { collection: item, stats: null };
          const collection = itemData.collection;
          const stats = itemData.stats;

          const collectionId = collection._id || collection.id || `${collection.name}-${index}`;
          const isFavorite = favorites.has(collectionId);

          // Extract data from OpenSea format
          const name = collection.name;
          const image = collection.image_url || collection.image;
          const slug = collection.collection || collection.slug || collectionId;
          const oneDay = stats?.intervals?.find((i: any) => i.interval === 'one_day');
          const sevenDay = stats?.intervals?.find((i: any) => i.interval === 'seven_day');
          const floorPrice = stats?.total?.floor_price ?? collection.floorPrice;
          const volume24h = (oneDay?.volume ?? collection.volume24h) ?? stats?.total?.volume;
          const marketCap = stats?.total?.market_cap ?? collection.marketCap;
          const priceChange = (sevenDay?.average_price && oneDay?.average_price)
            ? ((oneDay.average_price - sevenDay.average_price) / sevenDay.average_price) * 100
            : collection.priceChange24h;

          return (
            <Link
              key={`nft-${index}-${collectionId}`}
              href={`/nftrankings/${slug}`}
              className="block group"
            >
              <div
                data-nft-row
                className="grid gap-4 px-6 py-3 hover:bg-white/5 transition-colors duration-150 border-b border-white/5 cursor-pointer min-w-[900px]"
                style={{ gridTemplateColumns: '60px 30px 1fr 140px 110px 140px 140px' }}
              >
              {/* Rank - using global position in data array */}
              <div className="flex items-center">
                <span className={`text-sm font-bold ${index < 3 ? 'bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent' : 'text-gray-400'}`}>#{index + 1}</span>
              </div>

              {/* Star Icon */}
              <div className="flex items-center justify-center">
                <button
                  onClick={(e) => { e.preventDefault(); toggleFavorite(collectionId); }}
                  className="text-gray-500 hover:text-yellow-400 transition-colors"
                  title="Add to favorites"
                >
                  {isFavorite ? (
                    <StarIconSolid className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Collection Info */}
              <div className="flex items-center gap-3">
                {image && (
                  <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{name}</p>
                  {collection.chain && (
                    <span className={`text-xs px-2 py-0.5 rounded inline-block ${getChainBadgeColor(collection.chain)}`}>
                      {collection.chain}
                    </span>
                  )}
                </div>
              </div>

              {/* Floor Price */}
              <div className="flex flex-col items-end justify-center">
                <p className="text-sm font-bold text-white">
                  {formatFloorPrice(floorPrice)} ETH
                </p>
                <p className="text-xs text-gray-500">
                  {floorPrice ? formatPrice(floorPrice * 3000) : '-'}
                </p>
              </div>

              {/* 24h Change */}
              <div className={`flex items-center justify-end text-sm font-bold ${getChangeColor(priceChange)}`}>
                {priceChange !== undefined ? (
                  <span className="flex items-center gap-1">
                    {priceChange >= 0 ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    )}
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>

              {/* 24h Volume */}
              <div className="flex items-center justify-end text-sm text-white font-semibold">
                {formatPrice(volume24h)}
              </div>

              {/* Market Cap */}
              <div className="flex items-center justify-end text-sm text-white font-semibold">
                {formatPrice(marketCap)}
              </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-2 sm:space-y-3">
        {data.map((item, index) => {
          const data = (item as CombinedNFTData).collection ? (item as CombinedNFTData) : { collection: item, stats: null };
          const collection = data.collection;
          const stats = data.stats;

          const collectionId = collection._id || collection.id || `${collection.name}-${index}`;
          const isFavorite = favorites.has(collectionId);

          const name = collection.name;
          const image = collection.image_url || collection.image;
          const slug = collection.collection || collection.slug || collectionId;
          const floorPrice = stats?.floor_price || collection.floorPrice;
          const volume24h = stats?.total?.volume || collection.volume24h;
          const marketCap = stats?.market_cap || collection.marketCap;
          const priceChange = stats?.floor_price_change || collection.priceChange24h;

          return (
            <Link
              key={`nft-mobile-${index}-${collectionId}`}
              href={`/nftrankings/${slug}`}
              className="block group"
            >
              <div
                className="bg-gray-900/30 border border-white/5 rounded-xl p-4 hover:bg-gray-900/50 transition-colors cursor-pointer"
              >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {image && (
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                      <Image
                        src={image}
                        alt={name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400">#{index + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">{name}</p>
                    {collection.chain && (
                      <span className={`text-xs px-2 py-0.5 rounded inline-block mt-1 ${getChainBadgeColor(collection.chain)}`}>
                        {collection.chain}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); toggleFavorite(collectionId); }}
                  className="text-gray-500 hover:text-yellow-400 transition-colors flex-shrink-0"
                >
                  {isFavorite ? (
                    <StarIconSolid className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-gray-500 text-xs mb-1">Floor Price</p>
                  <p className="text-white font-semibold">{formatFloorPrice(floorPrice)} ETH</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-gray-500 text-xs mb-1">24h Change</p>
                  <p className={`font-semibold ${getChangeColor(priceChange)}`}>
                    {priceChange !== undefined ? `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%` : '-'}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-gray-500 text-xs mb-1">24h Volume</p>
                  <p className="text-white font-semibold">{formatPrice(volume24h)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-gray-500 text-xs mb-1">Market Cap</p>
                  <p className="text-white font-semibold">{formatPrice(marketCap)}</p>
                </div>
              </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More NFTs</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No NFT collections found</p>
        </div>
      )}
      </div>
    </NeonSnakeAnimation>
  );
}
