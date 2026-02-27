/**
 * NFT Watchlist API — Save/remove NFT collections to user profile.
 *
 * GET  → Returns user's watchlist with current floor prices
 * POST → Toggle a collection slug in the watchlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/dal';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User.model';
import { getCollectionStats, type OpenSeaError } from '@/lib/opensea';
import { logger } from '@/lib/logger';

const MAX_WATCHLIST = 50;

/* ── GET: list watchlist with floor prices ────────────────── */

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value ?? '';
    const session = await verifySession(token);

    if (!session?._id) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    await dbConnect();
    const user = await User.findById(session._id).select('nftWatchlist').lean();
    const watchlist: string[] = (user as unknown as Record<string, unknown>)?.nftWatchlist as string[] ?? [];

    // Fetch floor prices for each watched collection (parallel, error-tolerant)
    const enriched = await Promise.all(
      watchlist.map(async (slug) => {
        try {
          const { data: stats, fromCache } = await getCollectionStats(slug);
          return {
            slug,
            floorPrice: stats.total?.floor_price ?? null,
            floorPriceSymbol: stats.total?.floor_price_symbol ?? 'ETH',
            volume24h: stats.intervals?.find(
              (i: { interval: string }) => i.interval === 'one_day',
            )?.volume ?? null,
            marketCap: stats.total?.market_cap ?? null,
            fromCache,
          };
        } catch {
          return { slug, floorPrice: null, floorPriceSymbol: 'ETH', volume24h: null, marketCap: null, fromCache: false };
        }
      }),
    );

    // Suppress unused variable warning
    void req;

    return NextResponse.json({ version: 'v1', ok: true, data: enriched });
  } catch (error) {
    logger.error('NFT watchlist GET failed', { error: String(error) });
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'INTERNAL', message: 'Failed to fetch watchlist' } },
      { status: 500 },
    );
  }
}

/* ── POST: toggle collection in watchlist ─────────────────── */

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value ?? '';
    const session = await verifySession(token);

    if (!session?._id) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 },
      );
    }

    const body = await req.json();
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';

    if (!slug || slug.length > 200) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'VALIDATION', message: 'Invalid collection slug' } },
        { status: 400 },
      );
    }

    // Validate collection exists on OpenSea (optional — skip if rate limited)
    try {
      await getCollectionStats(slug);
    } catch (error) {
      const osError = error as OpenSeaError;
      if (osError.code === 'NOT_FOUND') {
        return NextResponse.json(
          { version: 'v1', ok: false, error: { code: 'NOT_FOUND', message: `Collection "${slug}" not found on OpenSea` } },
          { status: 404 },
        );
      }
      // Rate limited or network error → allow adding anyway (slug may be valid)
    }

    await dbConnect();
    const user = await User.findById(session._id).select('nftWatchlist');

    if (!user) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 },
      );
    }

    const watchlist: string[] = user.nftWatchlist ?? [];
    const index = watchlist.indexOf(slug);
    let action: 'added' | 'removed';

    if (index >= 0) {
      // Remove
      watchlist.splice(index, 1);
      action = 'removed';
    } else {
      // Add (with limit)
      if (watchlist.length >= MAX_WATCHLIST) {
        return NextResponse.json(
          { version: 'v1', ok: false, error: { code: 'LIMIT', message: `Watchlist limited to ${MAX_WATCHLIST} collections` } },
          { status: 400 },
        );
      }
      watchlist.push(slug);
      action = 'added';
    }

    user.nftWatchlist = watchlist;
    await user.save();

    return NextResponse.json({
      version: 'v1',
      ok: true,
      data: { slug, action, watchlistCount: watchlist.length },
    });
  } catch (error) {
    logger.error('NFT watchlist POST failed', { error: String(error) });
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'INTERNAL', message: 'Failed to update watchlist' } },
      { status: 500 },
    );
  }
}
