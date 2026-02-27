'use client';

// ============================================================
// PriceStalenessIndicator — Show LIVE / DELAYED / STALE badge
// ============================================================
// Critical for trading: users MUST know if the price is stale.
//   • LIVE     — WS connected + data < 5s old  (green)
//   • DELAYED  — data 5-30s old                 (yellow)
//   • STALE ⚠️ — data > 30s old or WS down      (red)
// ============================================================

import type { DataFreshness, ConnectionStatus } from '@/lib/websocket/types';

interface PriceStalenessIndicatorProps {
  /** Data freshness level */
  freshness: DataFreshness;
  /** WebSocket connection status */
  connectionStatus: ConnectionStatus;
  /** Optional: compact mode for small spaces */
  compact?: boolean;
}

const BADGE_CONFIG: Record<DataFreshness, { label: string; dot: string; text: string; bg: string; ring: string }> = {
  live: {
    label: 'LIVE',
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
  },
  delayed: {
    label: 'DELAYED',
    dot: 'bg-yellow-400',
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    ring: 'ring-yellow-500/20',
  },
  stale: {
    label: 'STALE',
    dot: 'bg-red-400',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    ring: 'ring-red-500/20',
  },
};

export default function PriceStalenessIndicator({
  freshness,
  connectionStatus,
  compact = false,
}: PriceStalenessIndicatorProps) {
  // Force stale if disconnected or error
  const effectiveFreshness: DataFreshness =
    connectionStatus === 'disconnected' || connectionStatus === 'error'
      ? 'stale'
      : freshness;

  const config = BADGE_CONFIG[effectiveFreshness];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${config.text}`}
        title={`Price data: ${config.label}`}
        aria-label={`Price data is ${config.label.toLowerCase()}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot} ${effectiveFreshness === 'live' ? 'animate-pulse' : ''}`} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider ring-1 ${config.bg} ${config.text} ${config.ring}`}
      aria-label={`Price data is ${config.label.toLowerCase()}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot} ${effectiveFreshness === 'live' ? 'animate-pulse' : ''}`}
      />
      {config.label}
      {effectiveFreshness === 'stale' && ' ⚠️'}
    </span>
  );
}
