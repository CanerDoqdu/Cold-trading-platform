import { useRef, useCallback } from 'react';

/**
 * Cancels prior in-flight requests when a new one is triggered.
 * Returns a stable `getSignal()` that components pass to fetch/safeFetch.
 *
 * Usage:
 *   const getSignal = useLatestRequest();
 *   const res = await safeFetch(url, { signal: getSignal() });
 */
export function useLatestRequest() {
  const controllerRef = useRef<AbortController | null>(null);

  return useCallback(() => {
    // abort previous
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    return controllerRef.current.signal;
  }, []);
}
