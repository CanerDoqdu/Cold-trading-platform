import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rateLimiter, getClientIP, getProfileForPath, RATE_LIMIT_PROFILES } from './rateLimit';

/* ── getClientIP ──────────────────────────────────────────── */

describe('getClientIP', () => {
  const makeRequest = (headers: Record<string, string>) =>
    new Request('http://localhost', { headers });

  it('extracts IP from x-forwarded-for (first entry)', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' });
    expect(getClientIP(req)).toBe('1.2.3.4');
  });

  it('extracts IP from cf-connecting-ip', () => {
    const req = makeRequest({ 'cf-connecting-ip': '5.6.7.8' });
    expect(getClientIP(req)).toBe('5.6.7.8');
  });

  it('extracts IP from x-real-ip', () => {
    const req = makeRequest({ 'x-real-ip': '9.0.1.2' });
    expect(getClientIP(req)).toBe('9.0.1.2');
  });

  it('returns "unknown" when no IP headers present', () => {
    const req = makeRequest({});
    expect(getClientIP(req)).toBe('unknown');
  });

  it('prefers x-forwarded-for over other headers', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.1.1.1',
      'cf-connecting-ip': '2.2.2.2',
      'x-real-ip': '3.3.3.3',
    });
    expect(getClientIP(req)).toBe('1.1.1.1');
  });
});

/* ── getProfileForPath ────────────────────────────────────── */

describe('getProfileForPath', () => {
  it('returns auth profile for login routes', () => {
    expect(getProfileForPath('/api/user/login')).toBe(RATE_LIMIT_PROFILES.auth);
  });

  it('returns auth profile for signup routes', () => {
    expect(getProfileForPath('/api/user/signup')).toBe(RATE_LIMIT_PROFILES.auth);
  });

  it('returns auth profile for google auth routes', () => {
    expect(getProfileForPath('/api/user/google')).toBe(RATE_LIMIT_PROFILES.auth);
  });

  it('returns ai profile for chat routes', () => {
    expect(getProfileForPath('/api/chat/messages')).toBe(RATE_LIMIT_PROFILES.ai);
  });

  it('returns ai profile for description-api', () => {
    expect(getProfileForPath('/api/description-api/btc')).toBe(RATE_LIMIT_PROFILES.ai);
  });

  it('returns data profile for coingecko routes', () => {
    expect(getProfileForPath('/api/coingecko/market')).toBe(RATE_LIMIT_PROFILES.data);
  });

  it('returns write profile for notifications', () => {
    expect(getProfileForPath('/api/notifications')).toBe(RATE_LIMIT_PROFILES.write);
  });

  it('returns write profile for price-alerts', () => {
    expect(getProfileForPath('/api/price-alerts')).toBe(RATE_LIMIT_PROFILES.write);
  });

  it('returns api profile for unknown routes', () => {
    expect(getProfileForPath('/api/something-else')).toBe(RATE_LIMIT_PROFILES.api);
  });
});

/* ── RateLimiter.check ────────────────────────────────────── */

describe('RateLimiter', () => {
  const config = { windowMs: 60_000, maxRequests: 3 };

  beforeEach(() => {
    rateLimiter.forceCleanup();
  });

  afterEach(() => {
    rateLimiter.forceCleanup();
  });

  it('allows first request', () => {
    const result = rateLimiter.check('test-ip-a', config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfter).toBe(0);
  });

  it('decrements remaining on successive requests', () => {
    rateLimiter.check('test-ip-b', config);
    const second = rateLimiter.check('test-ip-b', config);
    expect(second.remaining).toBe(1);

    const third = rateLimiter.check('test-ip-b', config);
    expect(third.remaining).toBe(0);
    expect(third.allowed).toBe(true);
  });

  it('blocks request when limit exceeded', () => {
    rateLimiter.check('test-ip-c', config);
    rateLimiter.check('test-ip-c', config);
    rateLimiter.check('test-ip-c', config);

    const fourth = rateLimiter.check('test-ip-c', config);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.retryAfter).toBeGreaterThan(0);
  });

  it('tracks IPs independently', () => {
    rateLimiter.check('ip-1', config);
    rateLimiter.check('ip-1', config);
    rateLimiter.check('ip-1', config);

    const result = rateLimiter.check('ip-2', config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('reports correct limit in result', () => {
    const result = rateLimiter.check('test-ip-d', config);
    expect(result.limit).toBe(3);
  });

  it('exposes store size', () => {
    rateLimiter.check('size-test', config);
    expect(rateLimiter.size).toBeGreaterThanOrEqual(1);
  });
});
