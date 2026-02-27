import { ClientSession } from 'mongoose';
import Portfolio from '@/models/Portfolio.model';
import type { IHolding } from '@/models/Portfolio.model';

/* ── Types ────────────────────────────────────────────────── */

export interface HoldingPnL {
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  totalValue: number;
  totalCost: number;
}

export interface UpdateHoldingParams {
  userId: string;
  coinId: string;
  symbol: string;
  name: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  session: ClientSession;
}

/* ── Helpers ──────────────────────────────────────────────── */

/**
 * Weighted average cost basis:
 *   newAvg = (oldAvg * oldQty + price * qty) / (oldQty + qty)
 *
 * Used when adding to an existing position.
 */
function weightedAverage(
  oldAvg: number,
  oldQty: number,
  newPrice: number,
  newQty: number,
): number {
  if (oldQty + newQty === 0) return 0;
  return (oldAvg * oldQty + newPrice * newQty) / (oldQty + newQty);
}

/* ── Core Functions ───────────────────────────────────────── */

/**
 * Update a user's portfolio holding inside a MongoDB transaction.
 *
 * **Buy**: adds to existing position with weighted average cost basis,
 *          or creates a new holding if first purchase.
 * **Sell**: subtracts from position. If amount reaches 0, removes the holding.
 *
 * @throws Error if selling more than owned
 */
export async function updateHolding({
  userId,
  coinId,
  symbol,
  name,
  side,
  amount,
  price,
  session,
}: UpdateHoldingParams): Promise<void> {
  // Fetch or create portfolio doc
  let portfolio = await Portfolio.findOne({ userId }).session(session);
  if (!portfolio) {
    portfolio = new Portfolio({ userId, holdings: [] });
  }

  const existingIdx = portfolio.holdings.findIndex(
    (h: IHolding) => h.coinId === coinId,
  );

  if (side === 'buy') {
    if (existingIdx >= 0) {
      // Existing holding → weighted average
      const existing = portfolio.holdings[existingIdx];
      const newAvg = weightedAverage(
        existing.buyPrice,
        existing.amount,
        price,
        amount,
      );
      portfolio.holdings[existingIdx].amount = existing.amount + amount;
      portfolio.holdings[existingIdx].buyPrice = newAvg;
    } else {
      // New holding
      portfolio.holdings.push({
        coinId,
        symbol: symbol.toUpperCase(),
        name,
        amount,
        buyPrice: price,
        buyDate: new Date(),
      } as IHolding);
    }
  } else {
    // Sell
    if (existingIdx < 0) {
      throw new Error(`No holdings found for ${symbol}`);
    }

    const existing = portfolio.holdings[existingIdx];
    if (existing.amount < amount) {
      throw new Error(
        `Insufficient holdings: have ${existing.amount} ${symbol}, trying to sell ${amount}`,
      );
    }

    const remaining = existing.amount - amount;
    if (remaining < 1e-12) {
      // Sell all — remove holding entirely (floating point guard)
      portfolio.holdings.splice(existingIdx, 1);
    } else {
      // Partial sell — keep avg buy price unchanged
      portfolio.holdings[existingIdx].amount = remaining;
    }
  }

  await portfolio.save({ session });
}

/**
 * Calculate P&L for a single holding given the current market price.
 */
export function calculatePnL(
  holding: { amount: number; buyPrice: number },
  currentPrice: number,
): HoldingPnL {
  const totalCost = holding.amount * holding.buyPrice;
  const totalValue = holding.amount * currentPrice;
  const unrealizedPnL = totalValue - totalCost;
  const unrealizedPnLPercent =
    totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

  return { unrealizedPnL, unrealizedPnLPercent, totalValue, totalCost };
}

/**
 * Get a user's current holdings for a specific coin.
 * Returns null if the user has no holding for that coin.
 */
export async function getHolding(
  userId: string,
  coinId: string,
): Promise<IHolding | null> {
  const portfolio = await Portfolio.findOne({ userId }).lean();
  if (!portfolio) return null;
  return (
    (portfolio.holdings as IHolding[]).find((h) => h.coinId === coinId) ?? null
  );
}
