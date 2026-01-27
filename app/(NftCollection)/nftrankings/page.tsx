import React, { Suspense } from "react";
import { getCombinedData } from "@/components/NftCollectiondata"; 
import NFTRankingsTable from "@/components/NftComponents/NFTRankingsTable";
import NFTRankingsTableSkeleton from "@/components/NftComponents/NFTRankingsTableSkeleton";

async function RankingsContent() {
  // SSR: Fetch the first 20 items for fast initial load
  const initialData = await getCombinedData(0, 20);
  return <NFTRankingsTable initialData={initialData} />;
}

export default async function CollectionsStatsPage() {
  return (
    <div className="text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/10 via-black to-black">
        {/* Simple gradient background - no animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-emerald-900/10" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-[85%] mx-auto py-16 lg:py-24">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-gray-300">Live NFT Market Data</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl lg:text-7xl font-bold">
              <span className="text-white">Top NFT</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Collections
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-gray-400 max-w-2xl leading-relaxed">
              Discover and track the most valuable NFT collections. Real-time floor prices, 
              market caps, and volume data from leading marketplaces.
            </p>

            {/* Stats Cards - Simplified */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Floor Price</p>
                    <p className="text-lg font-bold text-white">Real-time</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Volume Data</p>
                    <p className="text-lg font-bold text-white">24h Stats</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Collections</p>
                    <p className="text-lg font-bold text-white">Top Ranked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      </div>

      {/* Table Section */}
      <div className="max-w-[90%] lg:max-w-[85%] mx-auto py-10">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-purple-500" />
            <h2 className="text-xl font-bold text-white">NFT Rankings</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Updated in real-time</span>
          </div>
        </div>

        {/* Rankings Table - Simplified container */}
        <div className="rounded-xl bg-gray-900/30 border border-white/5 overflow-hidden">
          <Suspense fallback={<NFTRankingsTableSkeleton rows={5} />}>
            <RankingsContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
