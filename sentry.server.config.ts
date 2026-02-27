/**
 * Sentry Server Configuration
 *
 * Initializes Sentry on the Node.js server side for catching:
 * - API route errors
 * - Server component errors
 * - Server action errors
 * - Database operation failures
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',

  // Only enable if DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance sampling — lower on server to reduce overhead
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  environment: process.env.NODE_ENV || 'development',

  // Capture 100% of error events
  sampleRate: 1.0,

  beforeSend(event) {
    // Redact sensitive data from server errors
    if (event.extra) {
      const redactKeys = [
        'password',
        'token',
        'secret',
        'apiKey',
        'authorization',
        'cookie',
        'totpSecret',
      ];
      for (const key of redactKeys) {
        if (key in event.extra) {
          event.extra[key] = '[REDACTED]';
        }
      }
    }
    return event;
  },
});
