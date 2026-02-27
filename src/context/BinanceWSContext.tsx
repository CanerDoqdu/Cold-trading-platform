'use client';

// ============================================================
// BinanceWebSocketContext — React context for real-time data
// ============================================================
// Wraps BinanceWSManager in a React context so all components
// in the tree share a single multi-stream connection.
//
// Migration note: replaces old CryptoCompare-based WebSocketContext.
// Old exports (useWebSocket, useOptionalWebSocket) are preserved
// for backward compatibility via re-exports.
// ============================================================

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { BinanceWSManager } from '@/lib/websocket/manager';
import type {
  ConnectionStatus,
  TickerData,
  TradeData,
  OrderBookData,
  WSEvent,
  StreamSubscription,
} from '@/lib/websocket/types';

// ── Context Value ─────────────────────────────────────────

export interface BinanceWSContextValue {
  /** Current connection status */
  status: ConnectionStatus;
  /** Subscribe to a stream. Returns unsubscribe fn. */
  subscribe: (sub: StreamSubscription) => () => void;
  /** Get cached ticker for a symbol (e.g. "BTCUSDT") */
  getTicker: (symbol: string) => TickerData | undefined;
  /** Get cached trades for a symbol */
  getTrades: (symbol: string) => TradeData[] | undefined;
  /** Get cached order book for a symbol */
  getOrderBook: (symbol: string) => OrderBookData | undefined;
  /** Add event listener. Returns cleanup fn. */
  addListener: (listener: (event: WSEvent) => void) => () => void;
}

const BinanceWSContext = createContext<BinanceWSContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

interface BinanceWSProviderProps {
  children: ReactNode;
}

export function BinanceWSProvider({ children }: BinanceWSProviderProps) {
  const managerRef = useRef<BinanceWSManager | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  // Initialize manager
  useEffect(() => {
    const manager = BinanceWSManager.getInstance();
    managerRef.current = manager;

    const removeListener = manager.addListener((event) => {
      if (event.type === 'status') {
        setStatus(event.status);
      }
    });

    // Sync initial status
    setStatus(manager.getStatus());

    return () => {
      removeListener();
      // Don't destroy the singleton on unmount — other parts of the
      // app may still use it. Destroy happens on full app teardown.
    };
  }, []);

  const subscribe = useCallback((sub: StreamSubscription) => {
    const manager = managerRef.current;
    if (!manager) return () => {};
    return manager.subscribe(sub);
  }, []);

  const getTicker = useCallback((symbol: string) => {
    return managerRef.current?.getTicker(symbol);
  }, []);

  const getTrades = useCallback((symbol: string) => {
    return managerRef.current?.getTrades(symbol);
  }, []);

  const getOrderBook = useCallback((symbol: string) => {
    return managerRef.current?.getOrderBook(symbol);
  }, []);

  const addListener = useCallback((listener: (event: WSEvent) => void) => {
    const manager = managerRef.current;
    if (!manager) return () => {};
    return manager.addListener(listener);
  }, []);

  const value = useMemo<BinanceWSContextValue>(
    () => ({ status, subscribe, getTicker, getTrades, getOrderBook, addListener }),
    [status, subscribe, getTicker, getTrades, getOrderBook, addListener],
  );

  return (
    <BinanceWSContext.Provider value={value}>
      {children}
    </BinanceWSContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────

/**
 * Use the Binance WebSocket context.
 * Throws if not inside a BinanceWSProvider.
 */
export function useBinanceWS(): BinanceWSContextValue {
  const ctx = useContext(BinanceWSContext);
  if (!ctx) {
    throw new Error('useBinanceWS must be used within a <BinanceWSProvider>');
  }
  return ctx;
}

/**
 * Optionally use the Binance WebSocket context.
 * Returns null if outside provider — safe for shared components.
 */
export function useOptionalBinanceWS(): BinanceWSContextValue | null {
  return useContext(BinanceWSContext);
}
