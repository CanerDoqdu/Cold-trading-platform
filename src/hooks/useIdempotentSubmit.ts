import { useRef, useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { safeFetch, type SafeFetchOptions, type SafeResponse } from '@/lib/safeFetch';

/**
 * Prevents double-submit on mutating actions (e.g. order placement).
 *
 * Generates a unique idempotency key per submission attempt.
 * Disables re-submit while a request is in-flight.
 *
 * Usage:
 *   const { submit, submitting } = useIdempotentSubmit<Order>();
 *   <button disabled={submitting} onClick={() => submit('/api/v1/trade/order', { body })}>Buy</button>
 */
export function useIdempotentSubmit<T = unknown>() {
  const [submitting, setSubmitting] = useState(false);
  const inflightRef = useRef(false);

  const submit = useCallback(
    async (
      url: string,
      opts: Omit<SafeFetchOptions, 'method'> & { body?: unknown },
    ): Promise<SafeResponse<T>> => {
      if (inflightRef.current) {
        return {
          ok: false,
          status: 0,
          code: 'DUPLICATE_SUBMIT',
          message: 'A submission is already in progress',
          requestId: '',
        };
      }

      inflightRef.current = true;
      setSubmitting(true);

      const idempotencyKey = uuidv4();

      try {
        const headers = new Headers(opts.headers as HeadersInit);
        headers.set('Idempotency-Key', idempotencyKey);

        const result = await safeFetch<T>(url, {
          ...opts,
          method: 'POST',
          headers,
          body: opts.body ? JSON.stringify(opts.body) : undefined,
        });

        return result;
      } finally {
        inflightRef.current = false;
        setSubmitting(false);
      }
    },
    [],
  );

  return { submit, submitting };
}
