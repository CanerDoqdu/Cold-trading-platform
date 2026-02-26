/**
 * lib/env.ts — Runtime environment validation
 * Throws clearly at startup if any required variable is missing.
 * Import this in lib/dbConnect.ts so it runs before accepting traffic.
 */

const required = (name: string, minLength = 1): string => {
  const val = process.env[name];
  if (!val || val.trim().length < minLength) {
    throw new Error(
      `[env] Missing or invalid required environment variable: ${name}` +
        (minLength > 1 ? ` (min ${minLength} chars)` : '')
    );
  }
  return val.trim();
};

const optional = (name: string, fallback = ''): string => {
  return process.env[name]?.trim() ?? fallback;
};

// ── Validate at import time (fails loud at startup, never on first request) ──
export const env = {
  MONGODB_URI: required('MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET', 32),
  SESSION_SECRET: required('SESSION_SECRET', 32),
  GOOGLE_CLIENT_ID: required('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required('GOOGLE_CLIENT_SECRET'),
  COINGECKO_API_KEY: required('COINGECKO_API_KEY'),

  // Optional — defaults safe for dev
  NEXT_PUBLIC_SENTRY_DSN: optional('NEXT_PUBLIC_SENTRY_DSN'),
  GROQ_API_KEY: optional('GROQ_API_KEY'),
  GEMINI_API_KEY: optional('GEMINI_API_KEY'),
  OPENSEA_API_KEY: optional('OPENSEA_API_KEY'),
  TOTP_ISSUER_NAME: optional('TOTP_ISSUER_NAME', 'ColdTrade'),
  NEXT_PUBLIC_BASE_URL: optional('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000'),
  NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
} as const;
