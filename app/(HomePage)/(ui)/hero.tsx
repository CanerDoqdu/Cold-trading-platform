import React, { Suspense } from "react";
import { getCryptoPrices } from "@/components/Coingeckoapi";
import { fetchgeneralinfo, CoinInfo } from "@/components/CryptoGeneralInfo";
import {
  fetchCryptoChange,
  CryptoChanges,
} from "@/components/Crypto24HourChange";
import { fetchNews, NewsArticle } from "@/components/CryptoNews";
import { fetchNftInfo, NftInfo } from "@/components/Nfts";
import TypedAnimation from "@/components/TypedAnimation";
import CryptoPriceUpdater from "@/components/CryptoPrices";
import { WebSocketProvider } from "@/components/WebSocketContext";
import Image from "next/image";
import Link from "next/link";
import { getRedditData } from '@/components/redditapi/redditApi';
import HeroContent from "./HeroContent";

// Fetch trending coins for SSR
async function fetchTrendingCoins() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/coingecko/markets?vs_currency=usd&order=market_cap_desc&per_page=3&sparkline=false`, {
      next: { revalidate: 180 } // 3 min cache
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Separate async component for data-dependent content
async function HeroData() {
  const coinSymbols = ["BTC", "ETH", "SOL"];

  // Fetch all data simultaneously including trending
  const [coinInfos, initialPrices, cryptoChanges, newsArticles, nftInfos, redditPosts, trendingCoins] =
    await Promise.all([
      fetchgeneralinfo(coinSymbols),
      getCryptoPrices(),
      fetchCryptoChange(),
      fetchNews(),
      fetchNftInfo(),
      getRedditData(),
      fetchTrendingCoins(),
    ]);

  // Filter out NFTs with missing or non-renderable images to avoid broken thumbnails
  const filteredNfts = nftInfos.filter((nft) => {
    if (!nft.image_url) return false;
    const url = nft.image_url.toLowerCase();
    const hasValidExt = /(\.png|\.jpg|\.jpeg|\.webp)$/i.test(url);
    const isHttp = url.startsWith("http://") || url.startsWith("https://");
    return hasValidExt && isHttp;
  });

  const nftFallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%2318202c'/%3E%3Ctext x='50%25' y='50%25' fill='%235f708a' font-family='Arial' font-size='16' text-anchor='middle' dominant-baseline='middle'%3ENFT%3C/text%3E%3C/svg%3E";

  // Shuffle to present random NFTs on each request and cap to 20 items for layout stability
  const shuffled = [...filteredNfts];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const displayNfts = shuffled.slice(0, 20);
  
  return (
    <HeroContent 
      newsArticles={newsArticles}
      displayNfts={displayNfts}
      nftFallbackImg={nftFallbackImg}
      redditPosts={redditPosts}
      trendingCoins={trendingCoins}
    />
  );
}

// Loading skeleton for hero - shows LCP text immediately
function HeroSkeleton() {
  return (
    <section className="flex justify-between min-h-screen lg:h-lvh text-white bg-black relative overflow-x-hidden">
      <div className="w-full flex flex-col lg:flex-row justify-between max-w-section mx-auto px-4 sm:px-6 lg:px-0">
        <div className="pt-20 sm:pt-[90px] w-full lg:w-1/2">
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold lg:font-normal">Earn with Crypto</p>
          <p className="min-h-16 sm:min-h-24">
            <span className="text-[64px]">Trade Crypto</span>
          </p>
          <p className="text-sm sm:text-lg font-semibold">
            Start Today And Begin Earning Rewards Up To
          </p>
          <p className="text-lg sm:text-xl font-bold text-emerald-400">500 USDT</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-12">
            <div className="w-full sm:w-[300px] h-[44px] sm:h-[40px] rounded-[10px] border-2 border-emerald-500/50 bg-gray-900 animate-pulse" />
            <div className="w-24 h-10 rounded-md bg-emerald-500/50 animate-pulse" />
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-[542px] h-[400px] bg-gray-900/50 rounded-xl animate-pulse" />
        </div>
      </div>
    </section>
  );
}

const Hero = () => {
  return (
    <WebSocketProvider>
      <Suspense fallback={<HeroSkeleton />}>
        <HeroData />
      </Suspense>
    </WebSocketProvider>
  );
};

export default Hero;
