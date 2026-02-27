'use client';

// ============================================================
// useBinanceTicker — Subscribe to real-time ticker for a symbol
// ============================================================
// Returns normalized ticker data + connection status + freshness.
// Automatically subscribes/unsubscribes on mount/unmount.
// All instances sharing the same symbol reuse one stream.
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { useBinanceWS } from '@/context/BinanceWSContext';
import type { TickerData, DataFreshness, WSEvent } from '@/lib/websocket/types';

export interface UseBinanceTickerResult {
  /** Normalized ticker data (null until first message) */
  ticker: TickerData | null;
  /** Connection status */
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  /** Data freshness: live (<5s), delayed (5-30s), stale (>30s) */
  freshness: DataFreshness;
  /** Timestamp of last received update */
  lastUpdated: number | null;
}

/** Staleness thresholds in ms */
const DELAYED_THRESHOLD = 5_000;
const STALE_THRESHOLD = 30_000;

/**
 * Hook to subscribe to Binance ticker stream for a given symbol.
 *
 * @param symbol — e.g. "BTCUSDT" or "btcusdt"
 * @returns Real-time ticker data with freshness status
 */
export function useBinanceTicker(symbol: string): UseBinanceTickerResult {
  const { subscribe, getTicker, addListener, status } = useBinanceWS();
  const normalizedSymbol = symbol.toUpperCase();

  const [ticker, setTicker] = useState<TickerData | null>(() => getTicker(normalizedSymbol) ?? null);
  const [freshness, setFreshness] = useState<DataFreshness>('stale');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const freshnessTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to the ticker stream
  useEffect(() => {
    // Hydrate from cache immediately
    const cached = getTicker(normalizedSymbol);
    if (cached) {
      setTicker(cached);
      setLastUpdated(cached.lastUpdated);
    }

    const unsubscribe = subscribe({ symbol: normalizedSymbol, type: 'ticker' });
    return unsubscribe;
  }, [normalizedSymbol, subscribe, getTicker]);

  // Listen for ticker events for this symbol
  useEffect(() => {
    const removeListener = addListener((event: WSEvent) => {
      if (event.type === 'ticker' && event.data.symbol === normalizedSymbol) {
        setTicker(event.data);
        setLastUpdated(event.data.lastUpdated);
      }
    });
    return removeListener;
  }, [normalizedSymbol, addListener]);

  // Freshness computation
  const computeFreshness = useCallback((): DataFreshness => {
    if (!lastUpdated) return 'stale';
    const age = Date.now() - lastUpdated;
    if (age < DELAYED_THRESHOLD) return 'live';
    if (age < STALE_THRESHOLD) return 'delayed';
    return 'stale';
  }, [lastUpdated]);

  // Update freshness periodically
  useEffect(() => {
    setFreshness(computeFreshness());
    freshnessTimerRef.current = setInterval(() => {
      setFreshness(computeFreshness());
    }, 1_000);

    return () => {
      if (freshnessTimerRef.current) {
        clearInterval(freshnessTimerRef.current);
      }
    };
  }, [computeFreshness]);

  return { ticker, status, freshness, lastUpdated };
}
