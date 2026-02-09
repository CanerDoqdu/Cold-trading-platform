import { NextRequest, NextResponse } from 'next/server';
import { getCombinedData } from '@/components/NftCollectiondata';
import { nftCache } from '@/lib/serverCache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cacheKey = `nft_rankings_${offset}_${limit}`;

    // Try server cache first (prevents hammering OpenSea API)
    const cached = nftCache.get(cacheKey);
    if (cached) {
      console.log(`[NFT API] Cache HIT: ${cacheKey}`);
      return NextResponse.json(cached);
    }

    console.log(`[API] Fetching NFT rankings: offset=${offset}, limit=${limit}`);
    const data = await getCombinedData(offset, limit);
    console.log(`[API] Returned ${data.length} items. First collection: ${data[0]?.collection?.name}`);
    
    // Cache for 15 minutes (NFT data doesn't change that fast)
    nftCache.set(cacheKey, data, 15 * 60 * 1000);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching NFT rankings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
