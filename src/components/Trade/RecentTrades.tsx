'use client';

// ============================================================
// RecentTrades — Real-time trades from Binance trade stream
// ============================================================
// Uses real trade data from WebSocket when available.
// Falls back to generated placeholder when WS is disconnected.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import type { TradeData } from '@/lib/websocket/types';

interface RecentTradesProps {
  currentPrice: number;
  symbol: string;
  /** Real-time trades from WebSocket (optional, newest first) */
  liveTrades?: TradeData[];
}

interface DisplayTrade {
  id: number;
  price: number;
  amount: number;
  time: string;
  isBuy: boolean;
}

/** Format timestamp to HH:MM:SS */
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false });
}

export default function RecentTrades({ currentPrice, symbol, liveTrades }: RecentTradesProps) {
  const [placeholderTrades, setPlaceholderTrades] = useState<DisplayTrade[]>([]);

  // Generate placeholder trades only when no live data
  useEffect(() => {
    if (liveTrades && liveTrades.length > 0) return;

    const generate = () => {
      const trades: DisplayTrade[] = [];
      const now = Date.now();
      for (let i = 0; i < 15; i++) {
        const variation = (Math.random() - 0.5) * 0.002;
        trades.push({
          id: now - i,
          price: currentPrice * (1 + variation),
          amount: Math.random() * 0.5 + 0.01,
          time: formatTime(now - i * 1000 * (Math.random() * 10 + 5)),
          isBuy: Math.random() > 0.5,
        });
      }
      setPlaceholderTrades(trades);
    };

    generate();
    const interval = setInterval(() => {
      setPlaceholderTrades((prev) => {
        const variation = (Math.random() - 0.5) * 0.002;
        const newTrade: DisplayTrade = {
          id: Date.now(),
          price: currentPrice * (1 + variation),
          amount: Math.random() * 0.5 + 0.01,
          time: formatTime(Date.now()),
          isBuy: Math.random() > 0.5,
        };
        return [newTrade, ...prev.slice(0, 14)];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice, liveTrades]);

  // Normalize live trades to display format
  const displayTrades: DisplayTrade[] = useMemo(() => {
    if (liveTrades && liveTrades.length > 0) {
      return liveTrades.map((t) => ({
        id: t.id,
        price: t.price,
        amount: t.quantity,
        time: formatTime(t.time),
        isBuy: !t.isBuyerMaker, // buyer maker means the taker was selling
      }));
    }
    return placeholderTrades;
  }, [liveTrades, placeholderTrades]);

  const isLive = !!(liveTrades && liveTrades.length > 0);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Recent Trades</h3>
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
        <span className="w-1/3 text-right">Time</span>
      </div>

      {/* Trades */}
      <div className="max-h-[300px] overflow-y-auto">
        {displayTrades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between px-3 py-1 text-xs hover:bg-gray-800/30 transition-colors"
          >
            <span className={`w-1/3 ${trade.isBuy ? 'text-emerald-400' : 'text-red-400'}`}>
              {trade.price.toFixed(2)}
            </span>
            <span className="w-1/3 text-right text-gray-300">
              {trade.amount.toFixed(4)}
            </span>
            <span className="w-1/3 text-right text-gray-400">
              {trade.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
