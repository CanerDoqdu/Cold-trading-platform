/**
 * ============================================
 * ENVIRONMENT-SPECIFIC DEFAULTS
 * ============================================
 * Override defaults per environment (dev, staging, prod, test).
 * These are ONLY used when the env var is not set.
 */

export const environments = {
  development: {
    mongoPoolSize: 5,
    cacheTTLDefault: 60_000, // 1 min in dev
  },
  staging: {
    mongoPoolSize: 10,
    cacheTTLDefault: 180_000, // 3 min
  },
  production: {
    mongoPoolSize: 20,
    cacheTTLDefault: 300_000, // 5 min
  },
  test: {
    mongoPoolSize: 2,
    cacheTTLDefault: 0,
  },
} as const;

export type Environment = keyof typeof environments;
