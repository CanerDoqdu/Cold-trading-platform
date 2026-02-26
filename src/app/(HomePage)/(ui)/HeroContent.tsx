'use client';

import React, { useRef, useState, useEffect } from 'react';
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

// NFT Image with loading skeleton - clickable to individual NFT page
function NftImageCard({ nft, fallback }: { nft: NftInfo; fallback: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Build OpenSea URL for individual NFT
  const nftUrl = nft.contract_address && nft.token_id 
    ? `https://opensea.io/assets/ethereum/${nft.contract_address}/${nft.token_id}`
    : null;

  const content = (
    <div className="nft-item">
      <div className="relative w-[65px] h-[65px] overflow-hidden rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 dark:from-gray-800 via-gray-100 dark:via-gray-700 to-gray-200 dark:to-gray-800 rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/30 dark:via-gray-600/30 to-transparent animate-shimmer" />
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

  if (nftUrl) {
    return (
      <a 
        href={nftUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="cursor-pointer hover:scale-105 transition-transform duration-200"
      >
        {content}
      </a>
    );
  }

  return content;
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

  // Setup touch/swipe for NFT scroller - only on 640px+ screens
  useEffect(() => {
    // Skip touch handling on small screens
    if (window.innerWidth < 640) return;
    
    const scroller = document.querySelector<HTMLDivElement>('.nft-scroller');
    if (!scroller) return;
    
    const track = scroller.querySelector<HTMLDivElement>('.nft-track');
    if (!track) return;
    
    let isDown = false;
    let startX: number;
    let currentTranslate = 0;
    
    const getTranslateX = () => {
      const style = window.getComputedStyle(track);
      const matrix = new DOMMatrix(style.transform);
      return matrix.m41;
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      isDown = true;
      startX = e.touches[0].pageX;
      currentTranslate = getTranslateX();
      track.style.animationPlayState = 'paused';
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      const x = e.touches[0].pageX;
      const walk = x - startX;
      track.style.transform = `translate3d(${currentTranslate + walk}px, 0, 0)`;
    };
    
    const handleTouchEnd = () => {
      isDown = false;
      setTimeout(() => {
        track.style.transform = '';
        track.style.animationPlayState = 'running';
      }, 2000);
    };
    
    scroller.addEventListener('touchstart', handleTouchStart, { passive: true });
    scroller.addEventListener('touchmove', handleTouchMove, { passive: true });
    scroller.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      scroller.removeEventListener('touchstart', handleTouchStart);
      scroller.removeEventListener('touchmove', handleTouchMove);
      scroller.removeEventListener('touchend', handleTouchEnd);
    };
  }, [displayNfts]);

  return (
    <section className="flex justify-between min-h-screen lg:h-lvh text-gray-900 dark:text-white bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-black dark:via-black dark:to-black relative overflow-x-hidden">
      <HeroSnakeAnimation trendingRef={trendingRef} newsRef={newsRef} nftRef={nftRef} />
      <div className="w-full flex flex-col lg:flex-row justify-between max-w-section mx-auto px-4 sm:px-6 lg:px-0">
          <div className="pt-20 sm:pt-[90px] w-full lg:w-1/2">
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold lg:font-normal">Earn with Crypto</p>
            <p className="min-h-16 sm:min-h-24" style={{ height: '76px' }}>
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
                className="w-full sm:w-[300px] h-[44px] sm:h-[40px] rounded-[10px] border-2 border-emerald-500/50 placeholder-gray-500 bg-white dark:bg-[#000000] px-4 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-900/50"
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
              className="text-sm w-full lg:w-[560px] rounded-[20px] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 mt-6 sm:mt-10 lg:mt-[61px] overflow-hidden relative p-4 sm:p-6 shadow-xl shadow-slate-200/60 dark:shadow-emerald-900/20 hover:shadow-2xl hover:shadow-slate-300/70 dark:hover:shadow-emerald-900/40 transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-500/30"
            >
              <div className="flex items-center justify-between mb-4 ">
                <p className="text-[16px] font-semibold text-gray-900 dark:text-white">NFT's</p>
                <Link
                  href={{
                    pathname: '/nftrankings',
                  }}
                  className="text-sm text-emerald-600 dark:text-emerald-400/70 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-200 font-medium"
                >
                  View All NFTs
                </Link>
              </div>

              <div className="relative">
                {displayNfts.length === 0 ? (
                  <div className="pb-4">
                    <p className="text-gray-400 text-xs">No NFT thumbnails available right now.</p>
                  </div>
                ) : (
                  <div 
                    className="nft-scroller nft-fade-mask" 
                    data-animated="true"
                  >
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
              className="w-full lg:w-[542px] rounded-[20px] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3 shadow-xl shadow-slate-200/60 dark:shadow-emerald-900/20 hover:shadow-2xl hover:shadow-slate-300/70 dark:hover:shadow-emerald-900/40 transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-500/30"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Trending</p>
                <Link
                  href={{
                    pathname: '/markets',
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400/70 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-200 font-medium"
                >
                  View All
                </Link>
              </div>
              <TrendingCard initialData={trendingCoins} />
            </div>

            <div
              ref={newsRef}
              className="w-full lg:w-[542px] rounded-[20px] bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-3 sm:p-4 space-y-3 shadow-xl shadow-slate-200/60 dark:shadow-emerald-900/20 hover:shadow-2xl hover:shadow-slate-300/70 dark:hover:shadow-emerald-900/40 transition-all duration-300 hover:border-emerald-200 dark:hover:border-emerald-500/30"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">News</p>
                  <Link
                    href="/news"
                    className="text-xs text-emerald-600 dark:text-emerald-400/70 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors duration-200 font-medium"
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
                      className="flex items-center text-xs text-gray-600 dark:text-gray-400 line-clamp-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer py-1"
                    >
                      {article.title}
                    </a>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-200 dark:bg-gray-800" />

              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-gray-600 dark:text-gray-300 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Live Reddit
                </p>
                <div className="space-y-1">
                  <RedditSectionClient posts={redditPosts} />
                </div>
              </div>
            </div>

            {/* Stats Cards - aligned with NFT section on the left */}
            <div className="w-full lg:w-[542px] grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30 transition-all duration-200">
                <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">10M+</p>
                <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">Users</p>
              </div>
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30 transition-all duration-200">
                <p className="text-base sm:text-lg font-bold text-emerald-500 dark:text-emerald-300">$50B+</p>
                <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">Traded</p>
              </div>
              <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center shadow-lg shadow-slate-200/50 dark:shadow-none hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-100 dark:hover:shadow-emerald-900/30 transition-all duration-200">
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">150+</p>
                <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400">Countries</p>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
