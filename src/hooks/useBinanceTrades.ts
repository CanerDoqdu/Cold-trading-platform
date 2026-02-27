'use client';

// ============================================================
// useBinanceTrades — Subscribe to real-time trade stream
// ============================================================

import { useEffect, useState } from 'react';
import { useBinanceWS } from '@/context/BinanceWSContext';
import type { TradeData, WSEvent } from '@/lib/websocket/types';

export interface UseBinanceTradesResult {
  /** Recent trades (newest first, max 50) */
  trades: TradeData[];
  /** Connection status */
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}

/**
 * Hook to subscribe to Binance trade stream for a given symbol.
 *
 * @param symbol — e.g. "BTCUSDT"
 * @param maxTrades — max trades to keep (default: 50)
 */
export function useBinanceTrades(symbol: string, maxTrades = 50): UseBinanceTradesResult {
  const { subscribe, getTrades, addListener, status } = useBinanceWS();
  const normalizedSymbol = symbol.toUpperCase();

  const [trades, setTrades] = useState<TradeData[]>(() => getTrades(normalizedSymbol) ?? []);

  // Subscribe to trade stream
  useEffect(() => {
    const cached = getTrades(normalizedSymbol);
    if (cached) setTrades(cached);

    const unsubscribe = subscribe({ symbol: normalizedSymbol, type: 'trade' });
    return unsubscribe;
  }, [normalizedSymbol, subscribe, getTrades]);

  // Listen for trade events
  useEffect(() => {
    const removeListener = addListener((event: WSEvent) => {
      if (event.type === 'trade' && event.data.symbol === normalizedSymbol) {
        setTrades((prev) => [event.data, ...prev].slice(0, maxTrades));
      }
    });
    return removeListener;
  }, [normalizedSymbol, addListener, maxTrades]);

  return { trades, status };
}
