import { NextRequest, NextResponse } from 'next/server';
import { getCombinedData } from '@/components/NftCollectiondata';
import { nftCache } from '@/lib/serverCache';
import { withErrorHandler } from '@/lib/errors';
import { deduplicator } from '@/lib/cache';
import { logger } from '@/lib/logger';

const log = logger.child({ route: 'nft-rankings' });

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const cacheKey = `nft_rankings_${offset}_${limit}`;

  // Check cache first
  const cached = nftCache.get(cacheKey);
  if (cached) {
    log.debug('Cache HIT', { cacheKey });
    return NextResponse.json(cached);
  }

  // Deduplicated NFT fetch — prevents parallel OpenSea hammering
  const data = await deduplicator.dedupe(cacheKey, async () => {
    log.info('Fetching NFT rankings', { offset, limit });
    return getCombinedData(offset, limit);
  });

  // Cache for 15 minutes
  nftCache.set(cacheKey, data, 15 * 60 * 1000);
  return NextResponse.json(data);
});
