'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ── Types ────────────────────────────────────────────────── */

interface OrderItem {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  amount: number;
  price: number;
  totalUsd: number;
  slippageBps: number;
  status: string;
  filledAt: string | null;
  createdAt: string;
}

interface OrdersResponse {
  version: string;
  ok: boolean;
  data?: {
    orders: OrderItem[];
    nextCursor: string | null;
    hasMore: boolean;
  };
  error?: { code: string; message: string };
}

type SideFilter = 'all' | 'buy' | 'sell';

/* ── Helpers ──────────────────────────────────────────────── */

function formatUsd(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCrypto(value: number): string {
  if (value === 0) return '0';
  if (value >= 1) return value.toLocaleString('en-US', { maximumFractionDigits: 6 });
  return value.toLocaleString('en-US', { maximumFractionDigits: 8 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Extract short symbol from "BTC/USDT" → "BTC" */
function shortSymbol(symbol: string): string {
  return symbol.split('/')[0] || symbol;
}

/* ── CSV Export ───────────────────────────────────────────── */

function exportToCsv(orders: OrderItem[]) {
  const headers = ['Date', 'Symbol', 'Side', 'Type', 'Amount', 'Price (USD)', 'Total (USD)', 'Slippage %', 'Status'];
  const rows = orders.map((o) => [
    o.createdAt,
    o.symbol,
    o.side,
    o.type,
    o.amount.toString(),
    o.price.toFixed(2),
    o.totalUsd.toFixed(2),
    (o.slippageBps / 100).toFixed(2),
    o.status,
  ]);

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `coldtrade-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Component ────────────────────────────────────────────── */

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sideFilter, setSideFilter] = useState<SideFilter>('all');
  const [symbolFilter, setSymbolFilter] = useState('');
  const cursorRef = useRef<string | null>(null);
  const hasMoreRef = useRef(true);

  /* Fetch orders */
  const fetchOrders = useCallback(
    async (cursor?: string | null) => {
      try {
        const params = new URLSearchParams();
        if (cursor) params.set('cursor', cursor);
        if (sideFilter !== 'all') params.set('side', sideFilter);
        if (symbolFilter) params.set('symbol', symbolFilter.toUpperCase());

        const res = await fetch(`/api/v1/orders?${params.toString()}`);
        const data: OrdersResponse = await res.json();

        if (!data.ok || !data.data) {
          throw new Error(data.error?.message || 'Failed to fetch orders');
        }

        if (cursor) {
          setOrders((prev) => [...prev, ...data.data!.orders]);
        } else {
          setOrders(data.data.orders);
        }

        cursorRef.current = data.data.nextCursor;
        hasMoreRef.current = data.data.hasMore;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    },
    [sideFilter, symbolFilter],
  );

  /* Initial load + filter changes */
  useEffect(() => {
    setLoading(true);
    setError(null);
    cursorRef.current = null;
    hasMoreRef.current = true;
    fetchOrders(null).finally(() => setLoading(false));
  }, [fetchOrders]);

  /* Load more */
  async function handleLoadMore() {
    if (!hasMoreRef.current || loadingMore) return;
    setLoadingMore(true);
    await fetchOrders(cursorRef.current);
    setLoadingMore(false);
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>

        {/* Export CSV */}
        {orders.length > 0 && (
          <button
            onClick={() => exportToCsv(orders)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Side filter */}
        <div className="flex bg-gray-900 rounded-lg overflow-hidden">
          {(['all', 'buy', 'sell'] as SideFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setSideFilter(f)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sideFilter === f
                  ? f === 'buy'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : f === 'sell'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Symbol filter */}
        <input
          type="text"
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value)}
          placeholder="Filter by coin (e.g. BTC)"
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 w-48"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-900 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 text-lg mb-2">No orders yet</p>
          <p className="text-gray-600 text-sm">Your trade history will appear here</p>
        </div>
      )}

      {/* Orders table */}
      {!loading && orders.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Pair</th>
                  <th className="text-left py-3 px-4 font-medium">Side</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="text-right py-3 px-4 font-medium">Price</th>
                  <th className="text-right py-3 px-4 font-medium">Total</th>
                  <th className="text-right py-3 px-4 font-medium">Slippage</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-300 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{order.symbol}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          order.side === 'buy'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 capitalize">{order.type}</td>
                    <td className="py-3 px-4 text-white text-right font-mono">
                      {formatCrypto(order.amount)} {shortSymbol(order.symbol)}
                    </td>
                    <td className="py-3 px-4 text-white text-right font-mono">
                      ${formatUsd(order.price)}
                    </td>
                    <td className="py-3 px-4 text-white text-right font-mono font-medium">
                      ${formatUsd(order.totalUsd)}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-right font-mono">
                      {(order.slippageBps / 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-900 rounded-lg p-4 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{shortSymbol(order.symbol)}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        order.side === 'buy'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {order.side.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{order.type}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs block">Amount</span>
                    <span className="text-white font-mono">{formatCrypto(order.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Price</span>
                    <span className="text-white font-mono">${formatUsd(order.price)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs block">Total</span>
                    <span className="text-white font-mono font-medium">${formatUsd(order.totalUsd)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMoreRef.current && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition text-sm disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
