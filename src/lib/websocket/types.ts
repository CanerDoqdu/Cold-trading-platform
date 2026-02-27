// ============================================================
// WebSocket Type Definitions — Binance Public Stream Types
// ============================================================

/** Connection state machine */
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/** Data freshness for price staleness indicator */
export type DataFreshness = 'live' | 'delayed' | 'stale';

// ── Binance Stream Message Types ──────────────────────────

/** Binance 24h ticker stream payload */
export interface BinanceTickerMessage {
  /** Event type — always "24hrTicker" */
  e: '24hrTicker';
  /** Event time (ms) */
  E: number;
  /** Symbol (e.g. "BTCUSDT") */
  s: string;
  /** Price change */
  p: string;
  /** Price change percent */
  P: string;
  /** Weighted avg price */
  w: string;
  /** Previous close */
  x: string;
  /** Current price (last) */
  c: string;
  /** Best bid price */
  b: string;
  /** Best ask price */
  a: string;
  /** Open price */
  o: string;
  /** High price */
  h: string;
  /** Low price */
  l: string;
  /** Total traded base asset volume */
  v: string;
  /** Total traded quote asset volume */
  q: string;
  /** Statistics open time */
  O: number;
  /** Statistics close time */
  C: number;
  /** First trade ID */
  F: number;
  /** Last trade ID */
  L: number;
  /** Total number of trades */
  n: number;
}

/** Binance individual trade stream payload */
export interface BinanceTradeMessage {
  /** Event type — always "trade" */
  e: 'trade';
  /** Event time (ms) */
  E: number;
  /** Symbol */
  s: string;
  /** Trade ID */
  t: number;
  /** Price */
  p: string;
  /** Quantity */
  q: string;
  /** Buyer order ID */
  b: number;
  /** Seller order ID */
  a: number;
  /** Trade time (ms) */
  T: number;
  /** Is buyer maker */
  m: boolean;
}

/** Binance depth (order book) update: top 5 */
export interface BinanceDepthMessage {
  /** Last update ID */
  lastUpdateId: number;
  /** Bids [price, qty][] */
  bids: [string, string][];
  /** Asks [price, qty][] */
  asks: [string, string][];
}

/** Combined stream wrapper from Binance multi-stream endpoint */
export interface BinanceCombinedMessage<T = BinanceTickerMessage | BinanceTradeMessage | BinanceDepthMessage> {
  stream: string;
  data: T;
}

// ── Normalized Internal Types ─────────────────────────────

/** Normalized ticker data exposed to components */
export interface TickerData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  lastUpdated: number;
}

/** Normalized trade for display */
export interface TradeData {
  id: number;
  symbol: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

/** Normalized order book level */
export interface OrderBookLevel {
  price: number;
  quantity: number;
}

/** Normalized order book snapshot */
export interface OrderBookData {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateId: number;
  lastUpdated: number;
}

// ── Stream Subscription Types ─────────────────────────────

/** Types of Binance streams we support */
export type StreamType = 'ticker' | 'trade' | 'depth5';

/** A stream subscription request */
export interface StreamSubscription {
  symbol: string;
  type: StreamType;
}

/** Build Binance stream name from subscription */
export function toStreamName(sub: StreamSubscription): string {
  const sym = sub.symbol.toLowerCase().replace('/', '');
  switch (sub.type) {
    case 'ticker':
      return `${sym}@ticker`;
    case 'trade':
      return `${sym}@trade`;
    case 'depth5':
      return `${sym}@depth5@1000ms`;
  }
}

/** Parse symbol from Binance stream name */
export function parseStreamName(stream: string): { symbol: string; type: StreamType } | null {
  const match = stream.match(/^(\w+)@(ticker|trade|depth5)/);
  if (!match) return null;
  return {
    symbol: match[1].toUpperCase(),
    type: match[2] as StreamType,
  };
}

// ── WebSocket Manager Event Types ─────────────────────────

export type WSEventType = 'ticker' | 'trade' | 'depth' | 'status';

export interface WSTickerEvent {
  type: 'ticker';
  data: TickerData;
}

export interface WSTradeEvent {
  type: 'trade';
  data: TradeData;
}

export interface WSDepthEvent {
  type: 'depth';
  data: OrderBookData;
}

export interface WSStatusEvent {
  type: 'status';
  status: ConnectionStatus;
}

export type WSEvent = WSTickerEvent | WSTradeEvent | WSDepthEvent | WSStatusEvent;

export type WSEventListener = (event: WSEvent) => void;
