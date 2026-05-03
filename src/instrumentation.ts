/**
 * Next.js instrumentation hook — runs once when the server starts.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Sentry server-side initialization
    await import('../sentry.server.config');

    const { registerGracefulShutdown } = await import('@/lib/shutdown');
    registerGracefulShutdown();
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
