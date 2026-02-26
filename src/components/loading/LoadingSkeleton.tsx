"use client";

const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #0d131d 25%, #1a2332 50%, #0d131d 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }
`;

// Individual section skeletons
export const HeroSkeleton = () => (
  <div className="bg-black text-white">
    <style>{shimmerStyle}</style>
    <section className="flex justify-between min-h-screen lg:h-lvh bg-black">
      <div className="w-full flex flex-col lg:flex-row justify-between max-w-section mx-auto px-4 sm:px-6 lg:px-0">
        {/* Left Side */}
        <div className="pt-20 sm:pt-[90px] w-full lg:w-1/2">
          {/* Title */}
          <div className="skeleton h-12 sm:h-16 w-3/4 rounded mb-4" />
          {/* Typed animation area */}
          <div className="skeleton h-16 sm:h-24 w-full rounded mb-4" />
          {/* Subtitle */}
          <div className="skeleton h-5 w-2/3 rounded mb-2" />
          <div className="skeleton h-6 w-24 rounded mb-6" />
          {/* Input + Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="skeleton h-11 w-full sm:w-[300px] rounded-[10px]" />
            <div className="skeleton h-11 w-24 rounded-md" />
          </div>
          {/* NFT Card */}
          <div className="skeleton w-full lg:w-[560px] h-[200px] rounded-[20px] mt-6 sm:mt-10 lg:mt-[72px]" />
        </div>
        
        {/* Right Side */}
        <div className="flex flex-col gap-4 sm:gap-6 mt-6 lg:mt-12 pb-8 lg:pb-0 w-full lg:w-auto">
          {/* Trending Card */}
          <div className="skeleton w-full lg:w-[542px] h-[160px] rounded-[20px]" />
          {/* Reddit Card */}
          <div className="skeleton w-full lg:w-[542px] h-[140px] rounded-[20px]" />
          {/* Stats & Actions Cards */}
          <div className="flex gap-4">
            <div className="skeleton flex-1 lg:w-[260px] h-[120px] rounded-[20px]" />
            <div className="skeleton flex-1 lg:w-[260px] h-[120px] rounded-[20px]" />
          </div>
        </div>
      </div>
    </section>
  </div>
);

export const CarouselSectionSkeleton = () => (
  <div className="bg-black py-12 px-6">
    <style>{shimmerStyle}</style>
    <div className="skeleton h-8 w-40 rounded mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-48 rounded-lg" />
      ))}
    </div>
  </div>
);

export const EngagementSectionSkeleton = () => (
  <div className="bg-black py-12 px-6">
    <style>{shimmerStyle}</style>
    <div className="skeleton h-8 w-40 rounded mb-6" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-6 rounded" />
      ))}
    </div>
  </div>
);

export const WhyColdSkeleton = () => (
  <div className="min-h-lvh bg-black text-white">
    <style>{shimmerStyle}</style>
    <div className="max-w-[1920px] mx-auto">
      <div className="text-center pt-12">
        <div className="skeleton h-10 w-1/4 rounded mx-auto mb-12" />
      </div>
      <div className="flex mt-24 justify-center gap-[110px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-80 w-80 rounded-lg" />
        ))}
      </div>
      <div className="flex mt-24 justify-center gap-[170px]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center">
            <div className="skeleton h-8 w-32 rounded mx-auto mb-4" />
            <div className="skeleton h-6 w-48 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DiscoverNFTSSkeleton = () => (
  <div className="bg-black py-12 px-6">
    <style>{shimmerStyle}</style>
    <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
      <div className="w-full lg:w-1/2 flex justify-center mb-8 lg:mb-0">
        <div className="skeleton h-64 w-64 rounded-lg" />
      </div>
      <div className="text-white max-w-lg lg:text-left lg:mr-44">
        <div className="skeleton h-12 w-3/4 rounded mb-6" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-4/5 rounded" />
        </div>
        <div className="skeleton h-10 w-32 rounded mt-8" />
      </div>
    </div>
  </div>
);

// Market Page Skeleton
export const MarketPageSkeleton = () => (
  <div className="bg-black text-white">
    <style>{shimmerStyle}</style>
    <div className="h-[400px] bg-black flex flex-col justify-center items-center text-center px-4">
      <div className="skeleton h-12 w-1/2 rounded mb-4" />
      <div className="skeleton h-6 w-2/3 rounded" />
    </div>
    <div className="grid grid-cols-3 gap-6 mt-6 max-w-[80%] mx-auto">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between bg-gray-900 p-6 rounded-xl skeleton" style={{ height: "120px" }} />
      ))}
    </div>
    <div className="max-w-[80%] mx-auto mt-12 mb-12">
      <div className="skeleton h-80 w-full rounded-lg" />
    </div>
    <div className="grid grid-cols-3 gap-6 mt-6 max-w-[80%] mx-auto pb-12">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between bg-gray-900 p-6 rounded-xl skeleton" style={{ height: "120px" }} />
      ))}
    </div>
  </div>
);

// NFT Collection Page Skeleton
export const NFTPageSkeleton = () => (
  <div className="bg-black text-white">
    <style>{shimmerStyle}</style>
    <div className="py-12 px-6 text-center">
      <div className="skeleton h-10 w-1/3 rounded mx-auto mb-6" />
      <div className="skeleton h-6 w-1/2 rounded mx-auto" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-12">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="skeleton h-48 w-full rounded-lg" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// Legacy full page skeletons (kept for backward compatibility)
export const HomePageSkeleton = () => <HeroSkeleton />;
