import Image from "next/image";

interface NFT {
  identifier: string;
  display_image_url?: string;
  name?: string;
}

interface Offer {
  price?: {
    currency: string;
    decimals: number;
    value: string;
  };
}

export default function NFTGrid({
  slug,
  initialNfts,
  offers,
  gridCount,
}: {
  slug: string;
  initialNfts: NFT[];
  offers: Record<string, Offer>;
  gridCount: number;
}) {
  const filteredNfts = initialNfts.filter((nft) => nft.display_image_url);
  
  const gridClasses = `grid gap-3 sm:gap-4 ${
    gridCount === 5 
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" 
      : gridCount === 4 
        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" 
        : "grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9"
  }`;

  return (
    <div className={gridClasses}>
      {filteredNfts.length > 0 ? (
        filteredNfts.map((nft: NFT) => {
          const offer = offers[nft.identifier];
          const ethPrice =
            offer && offer.price && offer.price.value
              ? parseFloat(offer.price.value) / 1e18
              : null;

          return (
            <div 
              key={nft.identifier} 
              className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={nft.display_image_url || ""}
                  alt={nft.name || "NFT Image"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>

              {gridCount !== 9 && (
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white truncate">
                    {nft.name || `#${nft.identifier}`}
                  </h3>
                  {ethPrice !== null ? (
                    <p className="text-xs text-gray-300 font-semibold mt-1">
                      {ethPrice.toFixed(3)} ETH
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">No offers</p>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12 text-gray-400">
          No NFTs found in this collection.
        </div>
      )}
    </div>
  );
}
