import { describe, it, expect, vi, afterEach } from 'vitest';
import { logger } from './index';

describe('Logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates child logger with merged context', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const child = logger.child({ module: 'test', userId: '123' });
    child.info('hello');

    expect(spy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.module).toBe('test');
    expect(parsed.userId).toBe('123');
    expect(parsed.message).toBe('hello');
    expect(parsed.level).toBe('info');
  });

  it('forRequest creates logger with request context', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = logger.forRequest('req-abc', '/api/test', 'GET', 'user-1');
    log.info('request started');

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.requestId).toBe('req-abc');
    expect(parsed.path).toBe('/api/test');
    expect(parsed.method).toBe('GET');
    expect(parsed.userId).toBe('user-1');
  });

  it('forRequest works without userId', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = logger.forRequest('req-xyz', '/api/health', 'GET');
    log.info('health check');

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.requestId).toBe('req-xyz');
    expect(parsed.userId).toBeUndefined();
  });

  it('forTrade creates logger with trade context', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = logger.forTrade('BTC', 'buy', 'user-42');
    log.info('order placed');

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.module).toBe('trade');
    expect(parsed.coinSymbol).toBe('BTC');
    expect(parsed.orderSide).toBe('buy');
    expect(parsed.userId).toBe('user-42');
  });

  it('forApi creates logger with API provider context', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = logger.forApi('coingecko', '/simple/price');
    log.info('API call');

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.module).toBe('external-api');
    expect(parsed.provider).toBe('coingecko');
    expect(parsed.endpoint).toBe('/simple/price');
  });

  it('logs different levels correctly', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.debug('debug msg');
    logger.warn('warn msg');
    logger.error('error msg');

    expect(debugSpy).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(errorSpy).toHaveBeenCalledOnce();

    const debugParsed = JSON.parse(debugSpy.mock.calls[0][0] as string);
    expect(debugParsed.level).toBe('debug');

    const warnParsed = JSON.parse(warnSpy.mock.calls[0][0] as string);
    expect(warnParsed.level).toBe('warn');
  });

  it('includes timestamp in ISO format', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('ts test');

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('merges additional data into log entry', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('with data', { price: 45000, coin: 'BTC' });

    const parsed = JSON.parse(spy.mock.calls[0][0] as string);
    expect(parsed.price).toBe(45000);
    expect(parsed.coin).toBe('BTC');
  });
});
