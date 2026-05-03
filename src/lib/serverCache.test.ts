import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServerCache } from './serverCache';

describe('ServerCache', () => {
  let cache: InstanceType<typeof ServerCache>;

  beforeEach(() => {
    cache = new ServerCache({
      maxEntries: 5,
      defaultTTL: 10_000,
      maxMemoryMB: 1,
      name: 'TestCache',
    });
  });

  afterEach(() => {
    cache.destroy?.();
  });

  it('stores and retrieves a value', () => {
    cache.set('btc', { price: 45000 });
    expect(cache.get('btc')).toEqual({ price: 45000 });
  });

  it('returns undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('returns undefined for expired keys', async () => {
    cache.set('eth', { price: 3000 }, 1); // 1ms TTL

    // Wait for expiration
    await new Promise((r) => setTimeout(r, 20));
    expect(cache.get('eth')).toBeUndefined();
  });

  it('reports has() correctly', () => {
    cache.set('sol', 100);
    expect(cache.has('sol')).toBe(true);
    expect(cache.has('missing')).toBe(false);
  });

  it('deletes keys', () => {
    cache.set('ada', 0.5);
    expect(cache.delete('ada')).toBe(true);
    expect(cache.get('ada')).toBeUndefined();
  });

  it('clears all entries', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });

  it('evicts LRU entries when maxEntries exceeded', () => {
    for (let i = 0; i < 6; i++) {
      cache.set(`key-${i}`, i);
    }
    // First key should have been evicted (LRU)
    expect(cache.get('key-0')).toBeUndefined();
    // Last key should still exist
    expect(cache.get('key-5')).toBe(5);
  });

  it('overwrites existing key without double-counting', () => {
    cache.set('x', 'old');
    cache.set('x', 'new');
    expect(cache.get('x')).toBe('new');
  });

  it('getOrSet returns cached value on hit', async () => {
    cache.set('cached', 42);
    const fetcher = vi.fn().mockResolvedValue(99);

    const result = await cache.getOrSet('cached', fetcher);
    expect(result).toBe(42);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('getOrSet calls fetcher on miss and caches result', async () => {
    const fetcher = vi.fn().mockResolvedValue('fetched');

    const result = await cache.getOrSet('new-key', fetcher);
    expect(result).toBe('fetched');
    expect(fetcher).toHaveBeenCalledOnce();
    expect(cache.get('new-key')).toBe('fetched');
  });

  it('provides accurate stats', () => {
    cache.set('s1', 1);
    cache.get('s1'); // hit
    cache.get('s2'); // miss

    const stats = cache.getStats();
    expect(stats.name).toBe('TestCache');
    expect(stats.entries).toBe(1);
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe('50.0%');
  });
});
