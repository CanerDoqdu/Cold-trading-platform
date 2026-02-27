import { NextRequest, NextResponse } from 'next/server';
import { getNFTRankings, type OpenSeaError } from '@/lib/opensea';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { data, fromCache } = await getNFTRankings(offset, limit);

    return NextResponse.json(data, {
      headers: fromCache ? { 'X-Data-Source': 'cache' } : {},
    });
  } catch (error) {
    const osError = error as OpenSeaError;
    logger.error('NFT rankings fetch failed', { error: osError.message ?? String(error) });

    if (osError.code === 'RATE_LIMITED') {
      return NextResponse.json(
        { error: 'Rate limited by data provider. Please try again shortly.', retryAfter: osError.retryAfter },
        { status: 429, headers: { 'Retry-After': String(osError.retryAfter ?? 60) } },
      );
    }

    return NextResponse.json(
      { error: osError.message ?? 'Failed to fetch NFT rankings' },
      { status: osError.status || 500 },
    );
  }
}
