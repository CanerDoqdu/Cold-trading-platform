// app/[slug]/page.tsx
export const dynamic = 'force-dynamic';

import Image from "next/image";
import Link from "next/link";
import {
  getCollectionItems,
  getCollectionStats,
  getNFTs,
  getDescription,
  getBestOfferForNFT,
} from "@/components/NFtCollectionSolo";
import ExpandableText from "@/hooks/useLineClamp";
import { CheckBadgeIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import NFTGridWrapper from "@/components/NftComponents/NFTGridWrapper";

interface Params {
  slug: string;
}

interface SearchParams {
  search?: string;
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const slug = resolvedParams.slug;

  try {
    const collection = await getCollectionItems(slug);
    const stats = await getCollectionStats(slug);
    const nfts = await getNFTs(slug);
    const description = await getDescription(slug); // Fetch description here

    if (!collection || !nfts || nfts.length === 0) {
      return (
        <div className="text-red-500">No data found for collection: {slug}</div>
      );
    }

    // Use a default value for search query to avoid undefined error
    const searchQuery = resolvedSearchParams.search || ""; // Fallback to empty string if undefined
    const offers = await Promise.all(
      nfts.map(async (nft: { identifier: string; name: string; traits?: { value: string }[] }) => ({
        identifier: nft.identifier,
        offer: await getBestOfferForNFT(slug, nft.identifier),
      }))
    );
    const offersMap = Object.fromEntries(
      offers.map(({ identifier, offer }) => [identifier, offer])
    );
    // NFT'leri filtrele
    const filteredNfts = searchQuery
      ? nfts.filter((nft: { identifier: string; name: string; traits?: { value: string }[] }) => {
          const lowerQuery = searchQuery.toLowerCase();
          return (
            nft.name.toLowerCase().includes(lowerQuery) ||
            (nft.traits &&
              nft.traits.some((trait: { value: string }) =>
                trait.value.toLowerCase().includes(lowerQuery),
              ))
          );
        })
      : nfts;

    return (
      <div className="relative min-h-screen bg-black text-white">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-20">
          <Link 
            href="/nftrankings"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800/80 transition-all duration-200 text-sm text-gray-300 hover:text-white"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Rankings
          </Link>
        </div>

        {(collection.banner_image_url || collection.image_url) && (
          <div className="relative h-[350px] sm:h-[400px] lg:h-[450px] w-full mb-8">
            {collection.banner_image_url &&
            (collection.banner_image_url.endsWith(".mp4") ||
              collection.banner_image_url.endsWith(".webm")) ? (
              <video
                src={collection.banner_image_url}
                autoPlay
                loop
                muted
                className="object-cover w-full h-full opacity-70"
              />
            ) : (
              <Image
                src={collection.banner_image_url.replace(/w=\d+/, "w=1920")}
                alt="Banner Image"
                fill
                className="object-cover opacity-70"
                priority
                sizes="100vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 w-full max-w-screen-xl mx-auto">
                {/* Collection Info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative">
                    <Image
                      src={collection.image_url || "/placeholder.png"}
                      alt={collection.name || "Unnamed Collection"}
                      width={100}
                      height={100}
                      className="border-2 border-gray-600 rounded-xl shadow-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        {collection.name || "Unnamed Collection"}
                      </h1>
                      {collection.safelist_status === "verified" && (
                        <CheckBadgeIcon
                          className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">by {collection.owner || slug}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50">
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {stats?.total?.volume
                        ? stats.total.volume.toFixed(2)
                        : "-"}
                    </p>
                    <p className="text-xs text-gray-400">Total Volume</p>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50">
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {stats?.total?.floor_price
                        ? stats.total.floor_price.toFixed(2)
                        : "-"}{" "}
                      <span className="text-xs text-gray-400">ETH</span>
                    </p>
                    <p className="text-xs text-gray-400">Floor Price</p>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50">
                    <p className="text-lg sm:text-xl font-bold text-white">
                      {stats?.total?.average_price
                        ? stats.total.average_price.toFixed(3)
                        : "-"}
                    </p>
                    <p className="text-xs text-gray-400">Avg Price</p>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50 hidden sm:block">
                    <p className="text-lg sm:text-xl font-bold text-white">{stats?.total?.num_owners || "-"}</p>
                    <p className="text-xs text-gray-400">Owners</p>
                  </div>
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-center border border-gray-700/50 hidden sm:block">
                    <p className="text-lg sm:text-xl font-bold text-white">{stats?.total?.sales || "-"}</p>
                    <p className="text-xs text-gray-400">Sales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar Form */}
        <div className="max-w-screen-xl mx-auto mb-6 px-4">
          <form action="" method="get" className="flex gap-2">
            <input
              type="text"
              name="search"
              placeholder="Search by name or trait..."
              defaultValue={searchQuery}
              className="flex-1 max-w-md px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-all duration-200"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Search
            </button>
          </form>
        </div>

        {/* Render ExpandableText with the fetched description */}
        <div className="max-w-screen-xl mx-auto mb-8 px-4">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <ExpandableText description={description} />
          </div>
        </div>

        {/* Use NFTGridWrapper for grid display */}
        <div className="max-w-screen-xl mx-auto px-4 pb-12">
          <NFTGridWrapper slug={slug} initialNfts={filteredNfts} offers={offersMap} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching collection data:", error);
    return <div className="text-red-500">Error loading collection data.</div>;
  }
}
