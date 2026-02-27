import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User.model';
import Order from '@/models/Order.model';
import { withTransaction } from '@/lib/db/transaction';
import { updateHolding } from '@/lib/portfolio';
import { orderSchema } from '@/lib/schemas';
import { audit, extractRequestMeta } from '@/lib/auditLog';

/* ── Auth Helper ──────────────────────────────────────────── */

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.SECRET || 'fallback',
);

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return (payload.userId || payload._id) as string;
  } catch {
    return null;
  }
}

/* ── Constants ────────────────────────────────────────────── */

/** How many orders to return per page */
const PAGE_SIZE = 20;

/** Maximum allowed slippage in basis points (2% = 200 bps) */
const MAX_SLIPPAGE_BPS = 200;

/* ── Helpers ──────────────────────────────────────────────── */

/**
 * Convert a floating-point USD amount to integer minor units (cents) as a string.
 * E.g. 1234.56 → '123456'
 */
function toMinorUnits(usd: number): string {
  return Math.round(usd * 100).toString();
}

/**
 * Convert a floating-point price to micro-USD as a string.
 * E.g. 65432.123456 → '65432123456'
 */
function toMicroUsd(price: number): string {
  return Math.round(price * 1_000_000).toString();
}

/**
 * Convert a crypto amount to its atomic (8-decimal) integer string.
 * E.g. 0.00123456 → '123456'  (× 10^8)
 */
function toAtomicUnits(amount: number): string {
  return Math.round(amount * 1e8).toString();
}

/**
 * Fetch the current CoinGecko price for a coin.
 * Returns null on any failure.
 */
async function fetchCurrentPrice(coinId: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd`,
      { next: { revalidate: 0 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[coinId]?.usd ?? null;
  } catch {
    return null;
  }
}

/* ── POST /api/v1/orders — Create Order ──────────────────── */

export async function POST(request: NextRequest) {
  /* 1. Auth check */
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 },
    );
  }

  /* 2. Parse & validate body */
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON' } },
      { status: 400 },
    );
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 400 },
    );
  }

  const { symbol, coinId, coinName, side, amount, clientPrice, type, limitPrice, idempotencyKey } = parsed.data;

  await dbConnect();

  /* 3. Email verification gate */
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
      { status: 404 },
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'EMAIL_NOT_VERIFIED', message: 'Verify your email to trade' } },
      { status: 403 },
    );
  }

  /* 4. Idempotency check — reject duplicate order submissions */
  const existingOrder = await Order.findOne({ idempotencyKey }).lean();
  if (existingOrder) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'DUPLICATE_ORDER', message: 'Order already submitted' } },
      { status: 409 },
    );
  }

  /* 5. Get execution price */
  let executionPrice: number;

  if (type === 'limit' && limitPrice) {
    // Limit orders use the user's specified price
    executionPrice = limitPrice;
  } else {
    // Market orders — fetch live price from CoinGecko
    const livePrice = await fetchCurrentPrice(coinId);
    if (livePrice === null) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'PRICE_UNAVAILABLE', message: 'Unable to fetch current price. Try again.' } },
        { status: 503 },
      );
    }
    executionPrice = livePrice;
  }

  /* 6. Slippage check — reject if client price differs >2% from execution price */
  const slippageBps = Math.round(
    Math.abs((executionPrice - clientPrice) / clientPrice) * 10_000,
  );

  if (slippageBps > MAX_SLIPPAGE_BPS) {
    return NextResponse.json(
      {
        version: 'v1',
        ok: false,
        error: {
          code: 'PRICE_SLIPPAGE_TOO_HIGH',
          message: `Price moved ${(slippageBps / 100).toFixed(2)}% since your quote. Please refresh and retry.`,
          meta: { clientPrice, executionPrice, slippageBps },
        },
      },
      { status: 400 },
    );
  }

  /* 7. Balance / holdings pre-check (before transaction for fast feedback) */
  const totalCostUsd = amount * executionPrice;
  const userBalanceCents = parseInt(user.paperBalanceMinor, 10);

  if (side === 'buy') {
    const totalCostCents = Math.round(totalCostUsd * 100);
    if (userBalanceCents < totalCostCents) {
      const available = (userBalanceCents / 100).toFixed(2);
      const needed = totalCostUsd.toFixed(2);
      return NextResponse.json(
        {
          version: 'v1',
          ok: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: `Insufficient balance: $${available} available, $${needed} required`,
          },
        },
        { status: 400 },
      );
    }
  } else {
    // For sells, check holdings
    const { getHolding } = await import('@/lib/portfolio');
    const holding = await getHolding(userId, coinId);
    if (!holding || holding.amount < amount) {
      const available = holding?.amount ?? 0;
      return NextResponse.json(
        {
          version: 'v1',
          ok: false,
          error: {
            code: 'INSUFFICIENT_HOLDINGS',
            message: `Insufficient holdings: have ${available} ${symbol}, trying to sell ${amount}`,
          },
        },
        { status: 400 },
      );
    }
  }

  /* 8. Execute atomically inside a MongoDB transaction */
  const balanceDeltaCents =
    side === 'buy'
      ? -Math.round(totalCostUsd * 100) // deduct for buy
      : Math.round(totalCostUsd * 100); // add for sell

  try {
    const order = await withTransaction(async (session) => {
      // a) Create the filled order record
      const [createdOrder] = await Order.create(
        [
          {
            userId: new mongoose.Types.ObjectId(userId),
            symbol: `${symbol}/USDT`,
            side,
            type,
            amountAtomic: toAtomicUnits(amount),
            priceMicroUsd: toMicroUsd(executionPrice),
            totalMinor: toMinorUnits(totalCostUsd),
            status: 'filled',
            idempotencyKey,
            slippageBps,
            filledAt: new Date(),
          },
        ],
        { session },
      );

      // b) Update portfolio holdings (weighted avg cost basis for buys)
      await updateHolding({
        userId,
        coinId,
        symbol,
        name: coinName,
        side,
        amount,
        price: executionPrice,
        session,
      });

      // c) Update user's paper balance atomically
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            paperBalanceMinor: (userBalanceCents + balanceDeltaCents).toString(),
          },
        },
        { session, new: true },
      );

      if (!updatedUser) {
        throw new Error('Failed to update user balance');
      }

      return createdOrder;
    });

    /* 9. Audit log (fire-and-forget, outside transaction) */
    const { ip, userAgent } = extractRequestMeta(request);
    audit({
      userId,
      action: 'ORDER_PLACED',
      ip,
      userAgent,
      metadata: {
        orderId: order._id.toString(),
        symbol,
        side,
        type,
        amount,
        executionPrice,
        totalCostUsd,
        slippageBps,
        idempotencyKey,
      },
    }).catch(() => {
      /* audit failures are non-blocking */
    });

    /* 10. Return the filled order + updated balance */
    const newBalanceCents = userBalanceCents + balanceDeltaCents;
    return NextResponse.json(
      {
        version: 'v1',
        ok: true,
        data: {
          order: {
            id: order._id.toString(),
            symbol: order.symbol,
            side: order.side,
            type: order.type,
            amount,
            executionPrice,
            totalUsd: totalCostUsd,
            slippageBps,
            status: 'filled',
            filledAt: order.filledAt,
            createdAt: order.createdAt,
          },
          balance: {
            paperBalanceMinor: newBalanceCents.toString(),
            paperBalanceUsd: (newBalanceCents / 100).toFixed(2),
          },
        },
      },
      { status: 201 },
    );
  } catch (err) {
    // Check for duplicate key error (race condition on idempotency key)
    if (err instanceof Error && 'code' in err && (err as { code: number }).code === 11000) {
      return NextResponse.json(
        { version: 'v1', ok: false, error: { code: 'DUPLICATE_ORDER', message: 'Order already submitted' } },
        { status: 409 },
      );
    }

    // eslint-disable-next-line no-console
    console.error('[Orders API] Transaction failed:', err);
    return NextResponse.json(
      {
        version: 'v1',
        ok: false,
        error: {
          code: 'ORDER_FAILED',
          message: 'Order execution failed. Your balance was not affected. Please try again.',
        },
      },
      { status: 500 },
    );
  }
}

/* ── GET /api/v1/orders — List Orders (cursor-based) ─────── */

export async function GET(request: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { version: 'v1', ok: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor'); // ISO date string of last item's createdAt
  const sideFilter = searchParams.get('side'); // 'buy' | 'sell' | null
  const symbolFilter = searchParams.get('symbol'); // e.g. 'BTC' | null
  const limitParam = parseInt(searchParams.get('limit') || '', 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100
    ? limitParam
    : PAGE_SIZE;

  await dbConnect();

  // Build query
  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }
  if (sideFilter === 'buy' || sideFilter === 'sell') {
    query.side = sideFilter;
  }
  if (symbolFilter) {
    query.symbol = `${symbolFilter.toUpperCase()}/USDT`;
  }

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1) // fetch one extra to determine if there's a next page
    .lean();

  const hasMore = orders.length > limit;
  const results = hasMore ? orders.slice(0, limit) : orders;
  const nextCursor = hasMore
    ? results[results.length - 1].createdAt.toISOString()
    : null;

  return NextResponse.json({
    version: 'v1',
    ok: true,
    data: {
      orders: results.map((o) => ({
        id: o._id.toString(),
        symbol: o.symbol,
        side: o.side,
        type: o.type,
        amount: parseInt(o.amountAtomic, 10) / 1e8,
        price: parseInt(o.priceMicroUsd, 10) / 1e6,
        totalUsd: parseInt(o.totalMinor, 10) / 100,
        slippageBps: o.slippageBps ?? 0,
        status: o.status,
        filledAt: o.filledAt,
        createdAt: o.createdAt,
      })),
      nextCursor,
      hasMore,
    },
  });
}
