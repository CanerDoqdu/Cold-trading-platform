import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image?: string;
}

interface MarketState {
  /** Top coins list from CoinGecko / cache */
  coins: CoinPrice[];
  /** Currently selected coin id (detail view) */
  selectedCoinId: string | null;
  /** Lookup table for O(1) price access */
  priceMap: Record<string, number>;
  /** Last successful fetch timestamp (ms) */
  lastUpdated: number | null;
  /** Whether a fetch is in-flight */
  loading: boolean;
  error: string | null;

  setCoins: (coins: CoinPrice[]) => void;
  selectCoin: (id: string | null) => void;
  updatePrice: (id: string, price: number) => void;
  updatePrices: (updates: Record<string, number>) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useMarketStore = create<MarketState>()(
  devtools(
    (set) => ({
      coins: [],
      selectedCoinId: null,
      priceMap: {},
      lastUpdated: null,
      loading: false,
      error: null,

      setCoins: (coins) =>
        set(
          () => {
            const priceMap: Record<string, number> = {};
            for (const c of coins) priceMap[c.id] = c.current_price;
            return { coins, priceMap, lastUpdated: Date.now(), error: null };
          },
          false,
          'market/setCoins',
        ),

      selectCoin: (id) => set({ selectedCoinId: id }, false, 'market/selectCoin'),

      updatePrice: (id, price) =>
        set(
          (s) => ({ priceMap: { ...s.priceMap, [id]: price } }),
          false,
          'market/updatePrice',
        ),

      updatePrices: (updates) =>
        set(
          (s) => ({ priceMap: { ...s.priceMap, ...updates }, lastUpdated: Date.now() }),
          false,
          'market/updatePrices',
        ),

      setLoading: (loading) => set({ loading }, false, 'market/setLoading'),
      setError: (error) => set({ error, loading: false }, false, 'market/setError'),
    }),
    { name: 'MarketStore' },
  ),
);
