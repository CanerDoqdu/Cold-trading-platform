/**
 * ============================================
 * CRYPTO-SPECIFIC ERROR CLASSES
 * ============================================
 * Domain errors for the crypto trading platform.
 * Each carries structured context for Sentry tags and logger fields.
 *
 * Usage:
 *   throw new CryptoApiError('coingecko', 'Rate limit hit', 429);
 *   throw new OrderError('INSUFFICIENT_BALANCE', 'BTC', 'buy', 0.5);
 *   throw new WebSocketError('Connection timeout', 'binance-ws');
 *   throw new AuthError('Session expired during trade', 'TOKEN_EXPIRED');
 */

import { AppError } from './AppError';
import type { ErrorCode } from './errorCodes';

/* ── CryptoApiError ──────────────────────────────────────── */

/**
 * Errors from external crypto APIs (CoinGecko, OpenSea, CryptoCompare).
 * Always operational — the user can retry or see cached data.
 */
export class CryptoApiError extends AppError {
  public readonly provider: string;
  public readonly statusCode?: number;
  public readonly endpoint?: string;

  constructor(
    provider: string,
    message: string,
    statusCode?: number,
    endpoint?: string,
  ) {
    const code: ErrorCode =
      provider === 'coingecko'
        ? 'COINGECKO_ERROR'
        : provider === 'opensea'
          ? 'OPENSEA_ERROR'
          : 'EXTERNAL_SERVICE_ERROR';

    super(code, message, { provider, statusCode, endpoint });
    this.name = 'CryptoApiError';
    this.provider = provider;
    this.statusCode = statusCode;
    this.endpoint = endpoint;

    Object.setPrototypeOf(this, CryptoApiError.prototype);
  }
}

/* ── OrderError ──────────────────────────────────────────── */

/**
 * Trading order failures.
 * Critical for monitoring — every order error should trigger Sentry alerts.
 */
export class OrderError extends AppError {
  public readonly coinSymbol: string;
  public readonly orderSide: 'buy' | 'sell';
  public readonly requestedAmount?: number;
  public readonly availableBalance?: number;

  constructor(
    code: 'INSUFFICIENT_BALANCE' | 'DUPLICATE_ORDER' | 'PRICE_SLIPPAGE' | 'ORDER_FAILED',
    coinSymbol: string,
    orderSide: 'buy' | 'sell',
    requestedAmount?: number,
    availableBalance?: number,
    message?: string,
  ) {
    super(code, message, {
      coinSymbol,
      orderSide,
      requestedAmount,
      availableBalance,
    });
    this.name = 'OrderError';
    this.coinSymbol = coinSymbol;
    this.orderSide = orderSide;
    this.requestedAmount = requestedAmount;
    this.availableBalance = availableBalance;

    Object.setPrototypeOf(this, OrderError.prototype);
  }
}

/* ── WebSocketError ──────────────────────────────────────── */

/**
 * WebSocket connection/subscription failures.
 * Operational — client will auto-reconnect.
 */
export class WebSocketError extends AppError {
  public readonly channel?: string;

  constructor(
    message: string,
    channel?: string,
    code: 'WS_CONNECTION_FAILED' | 'WS_SUBSCRIPTION_FAILED' = 'WS_CONNECTION_FAILED',
  ) {
    super(code, message, { channel });
    this.name = 'WebSocketError';
    this.channel = channel;

    Object.setPrototypeOf(this, WebSocketError.prototype);
  }
}

/* ── AuthError ───────────────────────────────────────────── */

/**
 * Auth errors with crypto-specific context.
 * Critical when they occur during trade operations.
 */
export class AuthError extends AppError {
  public readonly duringTrade: boolean;

  constructor(
    message: string,
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'TOKEN_EXPIRED' | 'TOKEN_INVALID' | 'SESSION_EXPIRED_DURING_TRADE' = 'UNAUTHORIZED',
    duringTrade = false,
  ) {
    super(
      duringTrade ? 'SESSION_EXPIRED_DURING_TRADE' : code,
      message,
      { duringTrade },
    );
    this.name = 'AuthError';
    this.duringTrade = duringTrade;

    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
