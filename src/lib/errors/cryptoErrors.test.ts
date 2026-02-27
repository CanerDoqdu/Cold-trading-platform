import { describe, it, expect } from 'vitest';
import { CryptoApiError, OrderError, WebSocketError, AuthError } from './cryptoErrors';
import { AppError } from './AppError';

describe('CryptoApiError', () => {
  it('sets coingecko error code for coingecko provider', () => {
    const err = new CryptoApiError('coingecko', 'Rate limit', 429, '/simple/price');
    expect(err.code).toBe('COINGECKO_ERROR');
    expect(err.provider).toBe('coingecko');
    expect(err.statusCode).toBe(429);
    expect(err.endpoint).toBe('/simple/price');
    expect(err.httpStatus).toBe(502);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(CryptoApiError);
  });

  it('sets opensea error code for opensea provider', () => {
    const err = new CryptoApiError('opensea', 'Not found', 404);
    expect(err.code).toBe('OPENSEA_ERROR');
    expect(err.provider).toBe('opensea');
  });

  it('uses generic code for unknown providers', () => {
    const err = new CryptoApiError('cryptocompare', 'Timeout');
    expect(err.code).toBe('EXTERNAL_SERVICE_ERROR');
    expect(err.name).toBe('CryptoApiError');
  });
});

describe('OrderError', () => {
  it('creates insufficient balance error with trade context', () => {
    const err = new OrderError('INSUFFICIENT_BALANCE', 'BTC', 'buy', 0.5, 100);
    expect(err.code).toBe('INSUFFICIENT_BALANCE');
    expect(err.coinSymbol).toBe('BTC');
    expect(err.orderSide).toBe('buy');
    expect(err.requestedAmount).toBe(0.5);
    expect(err.availableBalance).toBe(100);
    expect(err.httpStatus).toBe(400);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(OrderError);
  });

  it('creates duplicate order error', () => {
    const err = new OrderError('DUPLICATE_ORDER', 'ETH', 'sell');
    expect(err.code).toBe('DUPLICATE_ORDER');
    expect(err.httpStatus).toBe(409);
  });

  it('creates price slippage error', () => {
    const err = new OrderError('PRICE_SLIPPAGE', 'SOL', 'buy');
    expect(err.code).toBe('PRICE_SLIPPAGE');
    expect(err.httpStatus).toBe(400);
  });

  it('accepts custom message', () => {
    const err = new OrderError('ORDER_FAILED', 'BTC', 'sell', undefined, undefined, 'DB write failed');
    expect(err.message).toBe('DB write failed');
    expect(err.httpStatus).toBe(500);
  });
});

describe('WebSocketError', () => {
  it('defaults to WS_CONNECTION_FAILED', () => {
    const err = new WebSocketError('Connection timeout', 'binance-ws');
    expect(err.code).toBe('WS_CONNECTION_FAILED');
    expect(err.channel).toBe('binance-ws');
    expect(err.httpStatus).toBe(503);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(AppError);
  });

  it('accepts subscription failed code', () => {
    const err = new WebSocketError('Sub failed', 'btc-ticker', 'WS_SUBSCRIPTION_FAILED');
    expect(err.code).toBe('WS_SUBSCRIPTION_FAILED');
  });

  it('works without channel', () => {
    const err = new WebSocketError('Unexpected close');
    expect(err.channel).toBeUndefined();
  });
});

describe('AuthError', () => {
  it('defaults to UNAUTHORIZED', () => {
    const err = new AuthError('Not logged in');
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.duringTrade).toBe(false);
    expect(err.httpStatus).toBe(401);
    expect(err).toBeInstanceOf(AppError);
  });

  it('uses SESSION_EXPIRED_DURING_TRADE when duringTrade=true', () => {
    const err = new AuthError('Session expired mid-order', 'TOKEN_EXPIRED', true);
    expect(err.code).toBe('SESSION_EXPIRED_DURING_TRADE');
    expect(err.duringTrade).toBe(true);
    expect(err.httpStatus).toBe(401);
  });

  it('preserves specified code when not during trade', () => {
    const err = new AuthError('Bad token', 'TOKEN_INVALID');
    expect(err.code).toBe('TOKEN_INVALID');
    expect(err.duringTrade).toBe(false);
  });
});
