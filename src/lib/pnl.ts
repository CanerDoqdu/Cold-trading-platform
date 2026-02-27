/**
 * P&L Calculation Service
 *
 * Provides server-side profit & loss calculations for user portfolios.
 * Uses weighted average cost basis (most common for retail crypto).
 *
 * Key concepts:
 * - Unrealized P&L: paper profit/loss based on current market price vs avg buy price
 * - Daily P&L: change in total portfolio value compared to yesterday's snapshot
 * - Portfolio metrics: total value, total cost, allocation percentages
 */

import dbConnect from '@/lib/dbConnect';
import Portfolio from '@/models/Portfolio.model';
import PortfolioSnapshot from '@/models/PortfolioSnapshot.model';
import { batchFetchPrices } from '@/lib/db/dataLoaders';
import type { IHolding } from '@/models/Portfolio.model';

/* ── Types ────────────────────────────────────────────────── */

export interface HoldingPnLResult {
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  /** Weight of this holding in the total portfolio (0-100) */
  allocationPercent: number;
}

export interface PortfolioPnLResult {
  holdings: HoldingPnLResult[];
  /** Sum of all current values */
  totalValue: number;
  /** Sum of all cost bases */
  totalCost: number;
  /** totalValue - totalCost */
  totalUnrealizedPnL: number;
  /** ((totalValue - totalCost) / totalCost) * 100 */
  totalUnrealizedPnLPercent: number;
  /** Paper trading balance in USD (from user model) */
  cashBalanceUsd: number;
  /** Cash + holdings value */
  netWorth: number;
  /** Change vs yesterday snapshot */
  dailyChange: number;
  dailyChangePercent: number;
  /** Prices fetched at this timestamp */
  pricesAsOf: string;
}

export interface SnapshotPoint {
  date: string; // ISO date string
  totalValue: number; // USD value of holdings only
}

/* ── Core Functions ───────────────────────────────────────── */

/**
 * Calculate P&L for a single holding given the current market price.
 */
export function getHoldingPnL(
  holding: { amount: number; buyPrice: number },
  currentPrice: number,
): { unrealizedPnL: number; unrealizedPnLPercent: number; totalValue: number; totalCost: number } {
  const totalCost = holding.amount * holding.buyPrice;
  const totalValue = holding.amount * currentPrice;
  const unrealizedPnL = totalValue - totalCost;
  const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;
  return { unrealizedPnL, unrealizedPnLPercent, totalValue, totalCost };
}

/**
 * Get the full portfolio P&L for a user.
 * Fetches holdings from DB, current prices from CoinGecko, and yesterday's snapshot.
 */
export async function getPortfolioPnL(
  userId: string,
  paperBalanceMinor: string,
): Promise<PortfolioPnLResult> {
  await dbConnect();

  // 1. Fetch portfolio holdings
  const portfolio = await Portfolio.findOne({ userId }).lean() as
    | { holdings: IHolding[] }
    | null;

  const holdings = portfolio?.holdings ?? [];
  const cashBalanceUsd = Number(paperBalanceMinor) / 100;

  if (holdings.length === 0) {
    return {
      holdings: [],
      totalValue: 0,
      totalCost: 0,
      totalUnrealizedPnL: 0,
      totalUnrealizedPnLPercent: 0,
      cashBalanceUsd,
      netWorth: cashBalanceUsd,
      dailyChange: 0,
      dailyChangePercent: 0,
      pricesAsOf: new Date().toISOString(),
    };
  }

  // 2. Batch-fetch current prices (single CoinGecko request)
  const coinIds = [...new Set(holdings.map((h) => h.coinId))];
  const prices = await batchFetchPrices(coinIds);

  // 3. Calculate per-holding P&L
  let totalValue = 0;
  let totalCost = 0;

  const holdingResults: HoldingPnLResult[] = holdings.map((h) => {
    const currentPrice = prices[h.coinId] ?? 0;
    const pnl = getHoldingPnL(h, currentPrice);
    totalValue += pnl.totalValue;
    totalCost += pnl.totalCost;

    return {
      coinId: h.coinId,
      symbol: h.symbol,
      name: h.name,
      amount: h.amount,
      avgBuyPrice: h.buyPrice,
      currentPrice,
      totalCost: pnl.totalCost,
      totalValue: pnl.totalValue,
      unrealizedPnL: pnl.unrealizedPnL,
      unrealizedPnLPercent: pnl.unrealizedPnLPercent,
      allocationPercent: 0, // calculated below
    };
  });

  // 4. Calculate allocation percentages
  if (totalValue > 0) {
    for (const h of holdingResults) {
      h.allocationPercent = (h.totalValue / totalValue) * 100;
    }
  }

  // Sort by value descending
  holdingResults.sort((a, b) => b.totalValue - a.totalValue);

  // 5. Daily change from yesterday's snapshot
  const { dailyChange, dailyChangePercent } = await getDailyChange(userId, totalValue);

  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return {
    holdings: holdingResults,
    totalValue,
    totalCost,
    totalUnrealizedPnL: totalPnL,
    totalUnrealizedPnLPercent: totalPnLPercent,
    cashBalanceUsd,
    netWorth: cashBalanceUsd + totalValue,
    dailyChange,
    dailyChangePercent,
    pricesAsOf: new Date().toISOString(),
  };
}

/**
 * Compare today's total portfolio value with yesterday's snapshot.
 */
async function getDailyChange(
  userId: string,
  currentTotalValue: number,
): Promise<{ dailyChange: number; dailyChangePercent: number }> {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  const snapshot = await PortfolioSnapshot.findOne({
    userId,
    date: { $lte: yesterday },
  })
    .sort({ date: -1 })
    .lean() as { totalValueMinor: string } | null;

  if (!snapshot) {
    return { dailyChange: 0, dailyChangePercent: 0 };
  }

  const prevValue = Number(snapshot.totalValueMinor) / 100;
  const change = currentTotalValue - prevValue;
  const percent = prevValue > 0 ? (change / prevValue) * 100 : 0;

  return { dailyChange: change, dailyChangePercent: percent };
}

/**
 * Get portfolio value snapshots for performance chart.
 * Returns up to `days` data points sorted by date ascending.
 */
export async function getPortfolioHistory(
  userId: string,
  days: number = 30,
): Promise<SnapshotPoint[]> {
  await dbConnect();

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  since.setUTCHours(0, 0, 0, 0);

  const snapshots = await PortfolioSnapshot.find({
    userId,
    date: { $gte: since },
  })
    .sort({ date: 1 })
    .lean() as Array<{ date: Date; totalValueMinor: string }>;

  return snapshots.map((s) => ({
    date: s.date.toISOString().split('T')[0],
    totalValue: Number(s.totalValueMinor) / 100,
  }));
}
