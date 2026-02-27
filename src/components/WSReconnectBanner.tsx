'use client';

// ============================================================
// WSReconnectBanner — Connection status banner
// ============================================================
// Shown at the top of the page when WebSocket disconnects.
//   • Disconnected/Error: yellow banner "Reconnecting to live feed..."
//   • Reconnected:        green flash "Live feed restored" (auto-hides)
//   • Connected:          hidden
// ============================================================

import { useEffect, useState, useRef } from 'react';
import type { ConnectionStatus } from '@/lib/websocket/types';

interface WSReconnectBannerProps {
  /** Current WebSocket connection status */
  status: ConnectionStatus;
}

export default function WSReconnectBanner({ status }: WSReconnectBannerProps) {
  const [showRestored, setShowRestored] = useState(false);
  const prevStatusRef = useRef<ConnectionStatus>(status);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    // Detect reconnection: was disconnected/error → now connected
    if (
      status === 'connected' &&
      (prev === 'disconnected' || prev === 'error' || prev === 'connecting')
    ) {
      setShowRestored(true);
      timerRef.current = setTimeout(() => {
        setShowRestored(false);
      }, 3_000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status]);

  // Reconnecting banner (yellow)
  if (status === 'disconnected' || status === 'error' || status === 'connecting') {
    return (
      <div
        role="alert"
        className="flex items-center justify-center gap-2 bg-yellow-500/15 border-b border-yellow-500/30 px-4 py-2 text-sm text-yellow-300"
      >
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span>
          {status === 'error'
            ? 'Connection error — retrying...'
            : 'Reconnecting to live feed...'}
        </span>
      </div>
    );
  }

  // Restored flash (green, auto-hides)
  if (showRestored) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 text-sm text-emerald-300 animate-pulse"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Live feed restored</span>
      </div>
    );
  }

  // Connected — no banner
  return null;
}
