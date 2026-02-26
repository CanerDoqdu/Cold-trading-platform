// components/ClientSearchComponent.tsx
"use client";
import React, { useState } from "react";
import useSearch from "@/hooks/useSearch"; // Ensure this hook returns JSX-compatible content
import { NFTData } from "@/types/coin";

type ClientSearchComponentProps = {
  initialNfts: NFTData[];
};

export default function ClientSearchComponent({ initialNfts }: ClientSearchComponentProps) {
  const { filteredNfts, searchQuery, setSearchQuery } = useSearch(initialNfts);

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search by name or trait"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 rounded bg-gray-800 text-gray-300"
        />
        <button type="submit" className="ml-2 p-2 rounded bg-blue-600 text-white">
          Search
        </button>
      </form>

      {/* Render filtered NFTs */}
      <div>
        {filteredNfts.map((nft) => (
          <div key={nft.id} className="p-4 bg-gray-700 rounded my-2">
            <h2 className="text-white">{nft.name}</h2>
            {/* Add more NFT info here if needed */}
          </div>
        ))}
      </div>
    </div>
  );
}
