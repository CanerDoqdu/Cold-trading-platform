"use client";

// Shimmer animation for skeleton loaders
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #1a1f3a 25%, #243456 50%, #1a1f3a 75%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
  }
`;

const SkeletonBase = ({ className }: { className: string }) => (
  <div className={`skeleton rounded ${className}`} />
);

// Hero Skeleton
export const HeroSkeleton = () => (
  <div className="w-full space-y-6 px-4 py-12">
    {/* Title skeleton */}
    <div className="space-y-3">
      <SkeletonBase className="h-12 w-3/4" />
      <SkeletonBase className="h-8 w-1/2" />
    </div>

    {/* Subtitle skeleton */}
    <div className="space-y-2">
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-5/6" />
    </div>

    {/* Button skeleton */}
    <div className="flex gap-4">
      <SkeletonBase className="h-12 w-40" />
      <SkeletonBase className="h-12 w-40" />
    </div>

    {/* Image/banner skeleton */}
    <SkeletonBase className="h-80 w-full" />
  </div>
);

// Carousel Card Skeleton
const CarouselCardSkeleton = () => (
  <div className="space-y-3 p-4">
    <SkeletonBase className="h-40 w-full rounded-lg" />
    <SkeletonBase className="h-4 w-3/4" />
    <SkeletonBase className="h-4 w-1/2" />
  </div>
);

export const CarouselSectionSkeleton = () => (
  <div className="w-full px-4 py-12 space-y-6">
    <SkeletonBase className="h-6 w-40" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <CarouselCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// News Article Skeleton
const NewsArticleSkeleton = () => (
  <div className="space-y-3 p-4 bg-gray-900 rounded-lg">
    <SkeletonBase className="h-5 w-full" />
    <SkeletonBase className="h-5 w-5/6" />
    <SkeletonBase className="h-4 w-40" />
  </div>
);

export const EngagementSectionSkeleton = () => (
  <div className="w-full px-4 py-12 space-y-6">
    <SkeletonBase className="h-6 w-40" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <NewsArticleSkeleton key={i} />
      ))}
    </div>
  </div>
);

// NFT Grid Card Skeleton
const NFTCardSkeleton = () => (
  <div className="space-y-3">
    <SkeletonBase className="h-48 w-full rounded-lg" />
    <SkeletonBase className="h-4 w-3/4" />
    <div className="flex gap-2">
      <SkeletonBase className="h-4 w-20" />
      <SkeletonBase className="h-4 w-20" />
    </div>
  </div>
);

export const NFTGridSkeleton = () => (
  <div className="w-full px-4 py-12 space-y-6">
    <SkeletonBase className="h-6 w-40" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <NFTCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Market Table Row Skeleton
const TableRowSkeleton = () => (
  <tr className="border-b border-gray-700">
    <td className="px-4 py-3"><SkeletonBase className="h-4 w-16" /></td>
    <td className="px-4 py-3"><SkeletonBase className="h-4 w-32" /></td>
    <td className="px-4 py-3"><SkeletonBase className="h-4 w-24" /></td>
    <td className="px-4 py-3"><SkeletonBase className="h-4 w-20" /></td>
    <td className="px-4 py-3"><SkeletonBase className="h-4 w-20" /></td>
  </tr>
);

export const MarketTableSkeleton = () => (
  <div className="space-y-4 px-4 py-6">
    <SkeletonBase className="h-6 w-40" />
    <SkeletonBase className="h-10 w-64" />
    <table className="w-full">
      <tbody>
        {Array.from({ length: 10 }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
);

// Full Page Skeletons
export const HomePageSkeleton = () => (
  <div className="bg-black text-white">
    <style>{shimmerStyle}</style>
    <HeroSkeleton />
    <CarouselSectionSkeleton />
    <EngagementSectionSkeleton />
    <NFTGridSkeleton />
  </div>
);

export const MarketPageSkeleton = () => (
  <div className="bg-black text-white">
    <style>{shimmerStyle}</style>
    <MarketTableSkeleton />
  </div>
);

export const NFTPageSkeleton = () => (
  <div className="bg-black text-white">
    <style>{shimmerStyle}</style>
    <div className="px-4 py-6 space-y-6">
      <SkeletonBase className="h-8 w-1/2" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
