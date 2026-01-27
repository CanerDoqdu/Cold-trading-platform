"use client";

import { useState, useEffect, useCallback } from "react";

interface Holding {
  _id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  buyDate: string;
  notes: string;
}

interface Portfolio {
  _id: string;
  userId: string;
  holdings: Holding[];
  createdAt: string;
  updatedAt: string;
}

interface HoldingWithCurrentPrice extends Holding {
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<HoldingWithCurrentPrice[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolio
  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/portfolio");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch portfolio");
      }

      setPortfolio(data.portfolio);

      // Fetch current prices for all holdings
      if (data.portfolio.holdings.length > 0) {
        await fetchCurrentPrices(data.portfolio.holdings);
      } else {
        setHoldings([]);
        setSummary({
          totalValue: 0,
          totalCost: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch current prices from CoinGecko
  const fetchCurrentPrices = async (holdingsList: Holding[]) => {
    try {
      const coinIds = [...new Set(holdingsList.map((h) => h.coinId))].join(",");
      const res = await fetch(
        `/api/coingecko/simple/price?ids=${coinIds}&vs_currencies=usd`
      );
      const prices = await res.json();

      let totalValue = 0;
      let totalCost = 0;

      const enrichedHoldings = holdingsList.map((holding) => {
        const currentPrice = prices[holding.coinId]?.usd || 0;
        const holdingTotalValue = holding.amount * currentPrice;
        const holdingTotalCost = holding.amount * holding.buyPrice;
        const profitLoss = holdingTotalValue - holdingTotalCost;
        const profitLossPercent = holdingTotalCost > 0 
          ? ((profitLoss / holdingTotalCost) * 100) 
          : 0;

        totalValue += holdingTotalValue;
        totalCost += holdingTotalCost;

        return {
          ...holding,
          currentPrice,
          totalValue: holdingTotalValue,
          totalCost: holdingTotalCost,
          profitLoss,
          profitLossPercent,
        };
      });

      setHoldings(enrichedHoldings);
      setSummary({
        totalValue,
        totalCost,
        totalProfitLoss: totalValue - totalCost,
        totalProfitLossPercent: totalCost > 0 
          ? ((totalValue - totalCost) / totalCost) * 100 
          : 0,
      });
    } catch (err) {
      console.error("Failed to fetch current prices:", err);
    }
  };

  // Add holding
  const addHolding = async (holdingData: {
    coinId: string;
    symbol: string;
    name: string;
    amount: number;
    buyPrice: number;
    buyDate?: string;
    notes?: string;
  }) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holdingData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add holding");
      }

      await fetchPortfolio();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to add holding" 
      };
    }
  };

  // Remove holding
  const removeHolding = async (holdingId: string) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove holding");
      }

      await fetchPortfolio();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to remove holding" 
      };
    }
  };

  // Update holding
  const updateHolding = async (
    holdingId: string,
    updates: {
      amount?: number;
      buyPrice?: number;
      buyDate?: string;
      notes?: string;
    }
  ) => {
    try {
      const res = await fetch("/api/portfolio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdingId, ...updates }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update holding");
      }

      await fetchPortfolio();
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to update holding" 
      };
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return {
    portfolio,
    holdings,
    summary,
    loading,
    error,
    addHolding,
    removeHolding,
    updateHolding,
    refreshPortfolio: fetchPortfolio,
  };
}
