import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Holding {
  _id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  buyDate: string;
  notes?: string;
  /** live price filled from market store / SWR */
  currentPrice?: number;
}

interface PortfolioState {
  holdings: Holding[];
  totalValue: number;
  totalPnL: number;
  loading: boolean;
  error: string | null;

  setHoldings: (h: Holding[]) => void;
  addHolding: (h: Holding) => void;
  updateHolding: (id: string, patch: Partial<Holding>) => void;
  removeHolding: (id: string) => void;
  /** Batch-update live prices by coinId → price */
  applyLivePrices: (prices: Record<string, number>) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

function recalcTotals(holdings: Holding[]) {
  let totalValue = 0;
  let totalCost = 0;
  for (const h of holdings) {
    const price = h.currentPrice ?? h.buyPrice;
    totalValue += h.amount * price;
    totalCost += h.amount * h.buyPrice;
  }
  return { totalValue, totalPnL: totalValue - totalCost };
}

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    (set) => ({
      holdings: [],
      totalValue: 0,
      totalPnL: 0,
      loading: false,
      error: null,

      setHoldings: (holdings) =>
        set(
          () => ({ holdings, ...recalcTotals(holdings), error: null }),
          false,
          'portfolio/setHoldings',
        ),

      addHolding: (h) =>
        set(
          (s) => {
            const next = [...s.holdings, h];
            return { holdings: next, ...recalcTotals(next) };
          },
          false,
          'portfolio/addHolding',
        ),

      updateHolding: (id, patch) =>
        set(
          (s) => {
            const next = s.holdings.map((h) => (h._id === id ? { ...h, ...patch } : h));
            return { holdings: next, ...recalcTotals(next) };
          },
          false,
          'portfolio/updateHolding',
        ),

      removeHolding: (id) =>
        set(
          (s) => {
            const next = s.holdings.filter((h) => h._id !== id);
            return { holdings: next, ...recalcTotals(next) };
          },
          false,
          'portfolio/removeHolding',
        ),

      applyLivePrices: (prices) =>
        set(
          (s) => {
            const next = s.holdings.map((h) =>
              prices[h.coinId] != null ? { ...h, currentPrice: prices[h.coinId] } : h,
            );
            return { holdings: next, ...recalcTotals(next) };
          },
          false,
          'portfolio/applyLivePrices',
        ),

      setLoading: (loading) => set({ loading }, false, 'portfolio/setLoading'),
      setError: (error) => set({ error, loading: false }, false, 'portfolio/setError'),
    }),
    { name: 'PortfolioStore' },
  ),
);
