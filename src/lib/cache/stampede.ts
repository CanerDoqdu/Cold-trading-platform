/**
 * Cache stampede prevention using a simple lock.
 *
 * When many concurrent requests miss the same cache key,
 * only one fetches from origin; others wait or return stale data.
 */

const locks = new Map<string, Promise<unknown>>();

export async function withStampedeLock<T>(
  key: string,
  fetchFn: () => Promise<T>,
  /** Max ms to wait for the lock holder before fetching anyway */
  maxWaitMs = 5_000,
): Promise<T> {
  const existing = locks.get(key);
  if (existing) {
    try {
      const result = await Promise.race([
        existing,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), maxWaitMs)),
      ]);
      if (result != null) return result as T;
    } catch {
      // lock holder failed — fall through and fetch
    }
  }

  const promise = fetchFn();
  locks.set(key, promise);

  try {
    return await promise;
  } finally {
    locks.delete(key);
  }
}
