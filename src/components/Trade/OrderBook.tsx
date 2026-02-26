'use client';

// ============================================================
// OrderBook — Real-time order book from Binance depth5 stream
// ============================================================
// Uses real depth data from WebSocket when available.
// Falls back to generated placeholder data when WS is disconnected.
// ============================================================

import { useMemo } from 'react';
import type { OrderBookData } from '@/lib/websocket/types';

interface OrderBookProps {
  currentPrice: number;
  symbol: string;
  /** Real-time order book from WebSocket (optional) */
  liveOrderBook?: OrderBookData | null;
}

interface Level {
  price: number;
  quantity: number;
  total: number;
}

/** Generate placeholder orders when no WS data */
function generatePlaceholder(basePrice: number, isBuy: boolean, count: number): Level[] {
  const levels: Level[] = [];
  for (let i = 0; i < count; i++) {
    const offset = (0.001 + 0.002 * (i + 1)) * (isBuy ? -1 : 1);
    const price = basePrice * (1 + offset);
    const quantity = 0.1 + Math.random() * 2;
    levels.push({ price, quantity, total: price * quantity });
  }
  return levels.sort((a, b) => (isBuy ? b.price - a.price : a.price - b.price));
}

export default function OrderBook({ currentPrice, symbol, liveOrderBook }: OrderBookProps) {
  const { asks, bids } = useMemo(() => {
    if (liveOrderBook && liveOrderBook.asks.length > 0 && liveOrderBook.bids.length > 0) {
      return {
        asks: liveOrderBook.asks.map((l) => ({ ...l, total: l.price * l.quantity })),
        bids: liveOrderBook.bids.map((l) => ({ ...l, total: l.price * l.quantity })),
      };
    }
    return {
      asks: generatePlaceholder(currentPrice, false, 5),
      bids: generatePlaceholder(currentPrice, true, 5),
    };
  }, [liveOrderBook, currentPrice]);

  const maxTotal = Math.max(
    ...asks.map((o) => o.total),
    ...bids.map((o) => o.total),
    1,
  );

  const isLive = !!(liveOrderBook && liveOrderBook.asks.length > 0);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Order Book</h3>
        {isLive && (
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        )}
      </div>

      {/* Headers */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400 border-b border-gray-800">
        <span className="w-1/3">Price (USDT)</span>
        <span className="w-1/3 text-right">Amount ({symbol})</span>
        <span className="w-1/3 text-right">Total</span>
      </div>

      {/* Asks (Sell orders) - Red */}
      <div className="relative">
        {asks.slice().reverse().map((level, i) => (
          <div key={`ask-${i}`} className="relative flex items-center justify-between px-3 py-1 text-xs">
            <div
              className="absolute inset-y-0 right-0 bg-red-500/10"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="w-1/3 text-red-400 relative z-10">
              {level.price.toFixed(2)}
            </span>
            <span className="w-1/3 text-right text-gray-300 relative z-10">
              {level.quantity.toFixed(4)}
            </span>
            <span className="w-1/3 text-right text-gray-400 relative z-10">
              {level.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Current Price */}
      <div className="flex items-center justify-center py-2 bg-gray-900 border-y border-gray-800">
        <span className="text-lg font-bold text-white">
          ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Bids (Buy orders) - Green */}
      <div className="relative">
        {bids.map((level, i) => (
          <div key={`bid-${i}`} className="relative flex items-center justify-between px-3 py-1 text-xs">
            <div
              className="absolute inset-y-0 right-0 bg-emerald-500/10"
              style={{ width: `${(level.total / maxTotal) * 100}%` }}
            />
            <span className="w-1/3 text-emerald-400 relative z-10">
              {level.price.toFixed(2)}
            </span>
            <span className="w-1/3 text-right text-gray-300 relative z-10">
              {level.quantity.toFixed(4)}
            </span>
            <span className="w-1/3 text-right text-gray-400 relative z-10">
              {level.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
