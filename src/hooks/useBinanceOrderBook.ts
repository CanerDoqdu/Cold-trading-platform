'use client';

// ============================================================
// useBinanceOrderBook — Subscribe to real-time order book
// ============================================================

import { useEffect, useState } from 'react';
import { useBinanceWS } from '@/context/BinanceWSContext';
import type { OrderBookData, WSEvent } from '@/lib/websocket/types';

export interface UseBinanceOrderBookResult {
  /** Order book snapshot (null until first message) */
  orderBook: OrderBookData | null;
  /** Connection status */
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
}

/**
 * Hook to subscribe to Binance depth5 stream for a given symbol.
 *
 * @param symbol — e.g. "BTCUSDT"
 */
export function useBinanceOrderBook(symbol: string): UseBinanceOrderBookResult {
  const { subscribe, getOrderBook, addListener, status } = useBinanceWS();
  const normalizedSymbol = symbol.toUpperCase();

  const [orderBook, setOrderBook] = useState<OrderBookData | null>(
    () => getOrderBook(normalizedSymbol) ?? null,
  );

  // Subscribe to depth stream
  useEffect(() => {
    const cached = getOrderBook(normalizedSymbol);
    if (cached) setOrderBook(cached);

    const unsubscribe = subscribe({ symbol: normalizedSymbol, type: 'depth5' });
    return unsubscribe;
  }, [normalizedSymbol, subscribe, getOrderBook]);

  // Listen for depth events
  useEffect(() => {
    const removeListener = addListener((event: WSEvent) => {
      if (event.type === 'depth' && event.data.symbol === normalizedSymbol) {
        setOrderBook(event.data);
      }
    });
    return removeListener;
  }, [normalizedSymbol, addListener]);

  return { orderBook, status };
}
