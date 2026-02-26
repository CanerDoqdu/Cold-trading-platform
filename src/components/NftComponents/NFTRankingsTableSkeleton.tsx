'use client';

export default function NFTRankingsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="hidden lg:grid gap-4 px-6 py-4 border-b border-gray-700/30" style={{ gridTemplateColumns: '60px 30px 1fr 140px 110px 140px 140px' }}>
        <div className="h-4 bg-gray-700/40 rounded w-12 animate-pulse"></div>
        <div></div>
        <div className="h-4 bg-gray-700/40 rounded w-24 animate-pulse"></div>
        <div className="h-4 bg-gray-700/40 rounded w-20 ml-auto animate-pulse"></div>
        <div className="h-4 bg-gray-700/40 rounded w-16 ml-auto animate-pulse"></div>
        <div className="h-4 bg-gray-700/40 rounded w-20 ml-auto animate-pulse"></div>
        <div className="h-4 bg-gray-700/40 rounded w-16 ml-auto animate-pulse"></div>
      </div>

      {/* Skeleton Rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="hidden lg:grid gap-4 px-6 py-4 bg-gray-900/10 rounded-lg border border-gray-700/10"
            style={{ gridTemplateColumns: '60px 30px 1fr 140px 110px 140px 140px' }}
          >
            {/* Rank */}
            <div className="h-5 bg-gray-700/30 rounded animate-pulse"></div>

            {/* Star */}
            <div className="h-5 w-5 bg-gray-700/30 rounded-full animate-pulse"></div>

            {/* Collection Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700/30 rounded-full flex-shrink-0 animate-pulse"></div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 bg-gray-700/30 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-700/20 rounded w-20 animate-pulse"></div>
              </div>
            </div>

            {/* Floor Price */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-700/30 rounded w-20 ml-auto animate-pulse"></div>
              <div className="h-3 bg-gray-700/20 rounded w-16 ml-auto animate-pulse"></div>
            </div>

            {/* 24h Change */}
            <div className="h-4 bg-gray-700/30 rounded w-16 ml-auto animate-pulse"></div>

            {/* 24h Volume */}
            <div className="h-4 bg-gray-700/30 rounded w-20 ml-auto animate-pulse"></div>

            {/* Market Cap */}
            <div className="h-4 bg-gray-700/30 rounded w-16 ml-auto animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={`mobile-${index}`}
            className="bg-gray-900/20 border border-gray-700/20 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gray-700/30 rounded-full flex-shrink-0 animate-pulse"></div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 bg-gray-700/30 rounded w-24 animate-pulse"></div>
                  <div className="h-3 bg-gray-700/20 rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="w-5 h-5 bg-gray-700/30 rounded flex-shrink-0 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-gray-700/20 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-700/30 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
