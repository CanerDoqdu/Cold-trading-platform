// hooks/useSearch.ts
import { useState, useMemo } from "react";
import { NFTData } from "@/types/coin";

export default function useSearch(initialNfts: NFTData[]) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  // useMemo ile senkron filtreleme - useEffect + setState'e göre daha performanslı
  // Gereksiz re-render'ları önler ve state güncellemesi için ekstra render döngüsü beklemez
  const filteredNfts = useMemo(() => {
    if (!searchQuery) {
      return initialNfts;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return initialNfts.filter((nft) =>
      nft.name.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, initialNfts]);

  return {
    filteredNfts,
    searchQuery,
    setSearchQuery,
  };
}
