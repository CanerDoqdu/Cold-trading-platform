'use client';

import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { safeFetch } from '@/lib/safeFetch';

const swrFetcher = async (url: string) => {
  const res = await safeFetch(url, { timeout: 10_000 });
  if (!res.ok) throw new Error(res.message);
  return res.data;
};

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        refreshInterval: 10_000,
        dedupingInterval: 5_000,
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        onErrorRetry(error, _key, _config, revalidate, { retryCount }) {
          // don't retry on 4xx
          if (error?.status >= 400 && error?.status < 500) return;
          // exponential backoff
          setTimeout(() => revalidate({ retryCount }), 2 ** retryCount * 1_000);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
