// ISR: revalidate every 15 minutes
export const revalidate = 900;

import Image from "next/image";
import Link from "next/link";
import {
  getCollection,
  getCollectionStats,
  getNFTsByCollection,
  getBestOffer,
} from "@/lib/opensea";
import ExpandableText from "@/hooks/useLineClamp";
import { CheckBadgeIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import NFTGridWrapper from "@/components/NftComponents/NFTGridWrapper";
import CollectionStats from "@/components/NftComponents/CollectionStats";
import NFTErrorBoundary from "@/components/NftComponents/NFTErrorBoundary";

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
    // Fetch collection info, stats, and NFTs in parallel
    const [collectionResult, statsResult, nftsResult] = await Promise.all([
      getCollection(slug),
      getCollectionStats(slug).catch(() => ({ data: null, fromCache: false })),
      getNFTsByCollection(slug, 50).catch(() => ({ data: [], fromCache: false })),
    ]);

    const collection = collectionResult.data;
    const stats = statsResult.data;
    const nfts = nftsResult.data;
    const fromCache = collectionResult.fromCache || statsResult.fromCache;

    if (!collection) {
      return (
        <NFTErrorBoundary
          title="Collection not found"
          message={`We couldn't find data for collection: ${slug}`}
        />
      );
    }

    const description = collection.description ?? 'No description available for this collection.';

    // Use a default value for search query
    const searchQuery = resolvedSearchParams.search || "";

    // Fetch best offers in parallel (with individual error handling)
    const offers = await Promise.all(
      nfts.map(async (nft) => {
        try {
          const { data: offer } = await getBestOffer(slug, nft.identifier);
          return { identifier: nft.identifier, offer };
        } catch {
          return { identifier: nft.identifier, offer: null };
        }
      })
    );
    const offersMap: Record<string, Record<string, unknown>> = {};
    for (const { identifier, offer } of offers) {
      if (offer != null) offersMap[identifier] = offer;
    }

    // Filter NFTs by search query
    const filteredNfts = searchQuery
      ? nfts.filter((nft) => {
          const lowerQuery = searchQuery.toLowerCase();
          return (
            (nft.name ?? '').toLowerCase().includes(lowerQuery) ||
            (nft.traits &&
              nft.traits.some((trait) =>
                trait.value.toLowerCase().includes(lowerQuery),
              ))
          );
        })
      : nfts;

    return (
      <div className="relative min-h-screen bg-black text-white">
        {/* Stale data indicator */}
        {fromCache && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-yellow-300 text-xs">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Refreshing...
          </div>
        )}

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
            ) : collection.banner_image_url ? (
              <Image
                src={collection.banner_image_url.replace(/w=\d+/, "w=1920")}
                alt="Banner Image"
                fill
                className="object-cover opacity-70"
                priority
                sizes="100vw"
              />
            ) : null}
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

                {/* Stats Grid — use CollectionStats component */}
                {stats && <CollectionStats stats={stats} />}
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
          {filteredNfts.length > 0 ? (
            <NFTGridWrapper slug={slug} initialNfts={filteredNfts} offers={offersMap} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? `No NFTs match "${searchQuery}"` : 'No NFTs found in this collection.'}
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return (
      <NFTErrorBoundary
        title="Error loading collection"
        message={message}
      />
    );
  }
}
