/**
 * Sentry Client Configuration
 *
 * Initializes Sentry on the browser side for catching:
 * - Unhandled JS errors
 * - Unhandled promise rejections
 * - React error boundaries
 * - Performance/transaction monitoring
 */

import * as Sentry from '@sentry/nextjs';

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',

  // Only enable if DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance sampling — 10% in production, 100% in dev
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay — captures user sessions for debugging
  replaysSessionSampleRate: 0.01, // 1% of sessions
  replaysOnErrorSampleRate: 0.5, // 50% of sessions with errors

  environment: process.env.NODE_ENV || 'development',

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    'ResizeObserver loop',
    'Non-Error promise rejection',
    // Network
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    // Next.js hydration
    'Hydration failed',
    'Text content does not match',
  ],

  beforeSend(event) {
    // Strip PII from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((bc) => {
        if (bc.data?.url) {
          // Remove query params that might contain tokens
          const url = new URL(bc.data.url as string, 'http://localhost');
          url.searchParams.delete('token');
          url.searchParams.delete('code');
          bc.data.url = url.pathname + url.search;
        }
        return bc;
      });
    }
    return event;
  },
});
