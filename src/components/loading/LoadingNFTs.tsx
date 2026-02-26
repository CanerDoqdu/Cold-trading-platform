// components/LoadingNFTs.tsx
import React from "react";

export default function LoadingNFTs() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse w-full h-40 bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  );
}
