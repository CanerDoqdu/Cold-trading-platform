'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import RedditSectionClient from '@/components/redditapi/RedditSectionClient';
import TrendingCard from '@/components/AllCryptos/TrendingCard';
import { NewsArticle } from '@/components/CryptoNews';
import { NftInfo } from '@/components/Nfts';

// Lazy load heavy components
const TypedAnimation = dynamic(() => import('@/components/TypedAnimation'), {
  ssr: false,
  loading: () => <span className="text-[64px]">Trade Crypto</span>,
});
const HeroSnakeAnimation = dynamic(() => import('@/components/HeroSnakeAnimation'), {
  ssr: false,
});

// NFT Image with loading skeleton
function NftImageCard({ nft, fallback }: { nft: NftInfo; fallback: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="nft-item">
      <div className="relative w-[65px] h-[65px] overflow-hidden rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent animate-shimmer" />
          </div>
        )}
        <Image
          src={hasError ? fallback : (nft.image_url || fallback)}
          alt={nft.name}
          width={65}
          height={65}
          className={`nft-img transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          quality={60}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </div>
      <p className="nft-name">{nft.name}</p>
    </div>
  );
}

interface RedditPost {
  title: string;
  url: string;
}

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface HeroContentProps {
  newsArticles: NewsArticle[];
  displayNfts: NftInfo[];
  nftFallbackImg: string;
  redditPosts: RedditPost[] | null;
  trendingCoins: TrendingCoin[];
}

export default function HeroContent({
  newsArticles,
  displayNfts,
  nftFallbackImg,
  redditPosts,
  trendingCoins,
}: HeroContentProps) {
  const trendingRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);
  const nftRef = useRef<HTMLDivElement>(null);

  return (
    <section className="flex justify-between min-h-screen lg:h-lvh text-white bg-black relative overflow-x-hidden">
      <HeroSnakeAnimation trendingRef={trendingRef} newsRef={newsRef} nftRef={nftRef} />
      <div className="w-full flex flex-col lg:flex-row justify-between max-w-section mx-auto px-4 sm:px-6 lg:px-0">
          <div className="pt-20 sm:pt-[90px] w-full lg:w-1/2">
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold lg:font-normal">Earn with Crypto</p>
            <p className="min-h-16 sm:min-h-24">
              <TypedAnimation />
            </p>
            <p className="text-sm sm:text-lg font-semibold">
              Start Today And Begin Earning Rewards Up To
            </p>
            <p className="text-lg sm:text-xl font-bold text-emerald-400">500 USDT</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-12">
              <input
                type="text"
                placeholder="Email/Phone number"
                className="w-full sm:w-[300px] h-[44px] sm:h-[40px] rounded-[10px] border-2 border-emerald-500/50 placeholder-gray-500 bg-[#000000] px-4 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-900/50"
              />
              <Link 
                href="/signup"
                className="text-black font-bold bg-emerald-500 hover:bg-emerald-400 border-b-4 rounded-md border-b-emerald-700 px-6 py-2 sm:py-1.5 text-sm sm:text-xs transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-105 text-center"
              >
                Sign Up
              </Link>
            </div>

            <div
              ref={nftRef}
              className="text-sm w-full lg:w-[560px] rounded-[20px] bg-gray-950 border border-gray-800 mt-6 sm:mt-10 lg:mt-[72px] overflow-hidden relative p-4 sm:p-6 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all duration-300 hover:border-emerald-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[16px] font-semibold">NFT's</p>
                <Link
                  href={{
                    pathname: '/nftrankings',
                  }}
                  className="text-sm text-emerald-400/70 hover:text-emerald-400 transition-colors duration-200 font-medium"
                >
                  View All NFTs
                </Link>
              </div>

              <div className="relative overflow-hidden">
                <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none z-10" />

                {displayNfts.length === 0 ? (
                  <div className="pb-4">
                    <p className="text-gray-400 text-xs">No NFT thumbnails available right now.</p>
                  </div>
                ) : (
                  <div className="nft-scroller" data-animated="true">
                    <div className="nft-track">
                      {[...displayNfts, ...displayNfts].map((nft, i) => (
                        <NftImageCard 
                          key={`${nft.name}-${i}`} 
                          nft={nft} 
                          fallback={nftFallbackImg} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 mt-6 lg:mt-12 pb-8 lg:pb-0">
            <div
              ref={trendingRef}
              className="w-full lg:w-[542px] rounded-[20px] bg-gray-950 border border-gray-800 p-3 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all duration-300 hover:border-emerald-500/30"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">Trending</p>
                <Link
                  href={{
                    pathname: '/markets',
                  }}
                  className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors duration-200 font-medium"
                >
                  View All
                </Link>
              </div>
              <TrendingCard initialData={trendingCoins} />
            </div>

            <div
              ref={newsRef}
              className="w-full lg:w-[542px] rounded-[20px] bg-gray-950 border border-gray-800 p-3 sm:p-4 space-y-3 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all duration-300 hover:border-emerald-500/30"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">News</p>
                  <Link
                    href="/news"
                    className="text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors duration-200 font-medium"
                  >
                    View More
                  </Link>
                </div>
                <div className="space-y-1">
                  {newsArticles.slice(0, 3).map((article, index) => (
                    <a 
                      key={index} 
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-gray-400 line-clamp-1 hover:text-white transition-colors cursor-pointer py-1.5 min-h-[36px]"
                    >
                      {article.title}
                    </a>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-800" />

              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-gray-300 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Live Reddit
                </p>
                <div className="space-y-1">
                  <RedditSectionClient posts={redditPosts} />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[542px]">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-center hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/30 transition-all duration-200">
                  <p className="text-sm sm:text-base font-bold text-emerald-400">10M+</p>
                  <p className="text-[7px] sm:text-[8px] text-gray-400">Users</p>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-center hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/30 transition-all duration-200">
                  <p className="text-sm sm:text-base font-bold text-emerald-300">$50B+</p>
                  <p className="text-[7px] sm:text-[8px] text-gray-400">Traded</p>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded-lg p-2 text-center hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/30 transition-all duration-200">
                  <p className="text-sm sm:text-base font-bold text-white">150+</p>
                  <p className="text-[7px] sm:text-[8px] text-gray-400">Countries</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Link
                  href="/markets"
                  className="bg-gray-950 border border-gray-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/30 rounded-lg p-2 transition-all duration-200 text-center hover:scale-105 hover:bg-emerald-900/10"
                >
                  <div className="text-base sm:text-lg mb-1">💰</div>
                  <p className="text-[7px] sm:text-[8px] font-semibold">Buy</p>
                </Link>

                <div className="bg-gray-950 border border-gray-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/30 rounded-lg p-2 transition-all duration-200 text-center cursor-pointer hover:scale-105 hover:bg-emerald-900/10">
                  <div className="text-base sm:text-lg mb-1">🎁</div>
                  <p className="text-[7px] sm:text-[8px] font-semibold">Earn</p>
                </div>

                <div className="bg-gray-950 border border-gray-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/30 rounded-lg p-2 transition-all duration-200 text-center cursor-pointer hover:scale-105 hover:bg-emerald-900/10">
                  <div className="text-base sm:text-lg mb-1">📊</div>
                  <p className="text-[7px] sm:text-[8px] font-semibold">Trade</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
