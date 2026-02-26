import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit';
export type OrderStatus = 'pending' | 'filled' | 'cancelled';

export interface Order {
  _id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  amount: number;
  price: number;
  status: OrderStatus;
  idempotencyKey?: string;
  createdAt: string;
}

interface TradeState {
  /* ── order form ── */
  formSymbol: string;
  formSide: OrderSide;
  formType: OrderType;
  formAmount: string;
  formPrice: string;

  /* ── orders ── */
  pendingOrders: Order[];
  orderHistory: Order[];
  submitting: boolean;
  error: string | null;

  /* ── actions ── */
  setFormField: (field: Partial<Pick<TradeState, 'formSymbol' | 'formSide' | 'formType' | 'formAmount' | 'formPrice'>>) => void;
  resetForm: () => void;
  setPendingOrders: (orders: Order[]) => void;
  setOrderHistory: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  removeOrder: (id: string) => void;
  setSubmitting: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

const formDefaults = {
  formSymbol: 'BTCUSDT',
  formSide: 'buy' as OrderSide,
  formType: 'market' as OrderType,
  formAmount: '',
  formPrice: '',
};

export const useTradeStore = create<TradeState>()(
  devtools(
    (set) => ({
      ...formDefaults,
      pendingOrders: [],
      orderHistory: [],
      submitting: false,
      error: null,

      setFormField: (partial) => set(partial, false, 'trade/setFormField'),
      resetForm: () => set(formDefaults, false, 'trade/resetForm'),

      setPendingOrders: (orders) => set({ pendingOrders: orders }, false, 'trade/setPending'),
      setOrderHistory: (orders) => set({ orderHistory: orders }, false, 'trade/setHistory'),

      addOrder: (order) =>
        set(
          (s) => ({
            pendingOrders: [order, ...s.pendingOrders],
            submitting: false,
            error: null,
          }),
          false,
          'trade/addOrder',
        ),

      removeOrder: (id) =>
        set(
          (s) => ({ pendingOrders: s.pendingOrders.filter((o) => o._id !== id) }),
          false,
          'trade/removeOrder',
        ),

      setSubmitting: (submitting) => set({ submitting }, false, 'trade/setSubmitting'),
      setError: (error) => set({ error, submitting: false }, false, 'trade/setError'),
    }),
    { name: 'TradeStore' },
  ),
);
