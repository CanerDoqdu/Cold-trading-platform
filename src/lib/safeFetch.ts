/**
 * safeFetch — typed fetch wrapper with timeout, retry, auto-refresh and abort support.
 *
 * Usage:
 *   const { ok, data, status } = await safeFetch<User>('/api/v1/user/me');
 *   if (!ok) showToast(data.error.message);
 */

/* ── types ── */
export interface SafeResult<T> {
  ok: true;
  status: number;
  data: T;
  requestId: string;
}

export interface SafeError {
  ok: false;
  status: number;
  code: string;
  message: string;
  requestId: string;
}

export type SafeResponse<T> = SafeResult<T> | SafeError;

export interface SafeFetchOptions extends Omit<RequestInit, 'signal'> {
  /** Timeout in ms (default 10 000) */
  timeout?: number;
  /** Number of retries on network errors — NOT on 4xx (default 2) */
  retries?: number;
  /** If true, skip auto token-refresh on 401 */
  skipRefresh?: boolean;
  /** External AbortSignal (e.g. from a component unmount) */
  signal?: AbortSignal;
}

/* ── internal state ── */
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ── main function ── */
export async function safeFetch<T = unknown>(
  url: string,
  opts: SafeFetchOptions = {},
): Promise<SafeResponse<T>> {
  const {
    timeout = 10_000,
    retries = 2,
    skipRefresh = false,
    signal: externalSignal,
    ...init
  } = opts;

  const requestId = crypto.randomUUID();

  const headers = new Headers(init.headers);
  headers.set('X-Request-ID', requestId);

  // read CSRF cookie for mutating requests
  if (init.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method.toUpperCase())) {
    const csrfMatch = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
    if (csrfMatch) headers.set('X-CSRF-Token', csrfMatch[1]);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();

    // link external signal
    if (externalSignal) {
      if (externalSignal.aborted) {
        return { ok: false, status: 0, code: 'ABORTED', message: 'Request aborted', requestId };
      }
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        ...init,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timer);

      // auto refresh on 401
      if (res.status === 401 && !skipRefresh && attempt === 0) {
        const refreshed = await attemptTokenRefresh();
        if (refreshed) continue; // retry original request once
        // refresh failed — redirect to login
        if (typeof window !== 'undefined') window.location.href = '/login';
        return { ok: false, status: 401, code: 'SESSION_EXPIRED', message: 'Session expired', requestId };
      }

      if (res.ok) {
        const data = (await res.json()) as T;
        return { ok: true, status: res.status, data, requestId };
      }

      // client/server error — don't retry 4xx
      let body: Record<string, unknown> = {};
      try { body = await res.json(); } catch { /* empty body */ }
      const code = (body?.error as Record<string, unknown>)?.code as string || 'API_ERROR';
      const message = (body?.error as Record<string, unknown>)?.message as string || res.statusText;
      return { ok: false, status: res.status, code, message, requestId };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if ((err as Error).name === 'AbortError') {
        return {
          ok: false,
          status: 0,
          code: externalSignal?.aborted ? 'ABORTED' : 'TIMEOUT',
          message: externalSignal?.aborted ? 'Request aborted' : `Request timed out after ${timeout}ms`,
          requestId,
        };
      }

      // network error — retry
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        continue;
      }
    }
  }

  return {
    ok: false,
    status: 0,
    code: 'NETWORK_ERROR',
    message: (lastError as Error)?.message || 'Network error',
    requestId,
  };
}
