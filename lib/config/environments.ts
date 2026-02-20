/**
 * ============================================
 * ENVIRONMENT-SPECIFIC OVERRIDES
 * ============================================
 * Defaults that change per environment.
 * These are merged UNDER env vars (env vars always win).
 */

import { ConfigSchema } from './schema';

type PartialConfig = Partial<ConfigSchema>;

export const developmentDefaults: PartialConfig = {
  logLevel: 'debug',
  cacheTTLDefault: 30_000,          // 30s — faster iteration
  rateLimitMaxRequests: 200,        // lenient in dev
};

export const stagingDefaults: PartialConfig = {
  logLevel: 'info',
  cacheTTLDefault: 3 * 60_000,     // 3 min
  rateLimitMaxRequests: 100,
};

export const productionDefaults: PartialConfig = {
  logLevel: 'warn',
  cacheTTLDefault: 5 * 60_000,     // 5 min
  rateLimitMaxRequests: 100,
};

export const testDefaults: PartialConfig = {
  logLevel: 'error',               // quiet during tests
  cacheTTLDefault: 0,              // no cache in tests
  rateLimitMaxRequests: 9999,      // no rate limit in tests
};

export function getEnvironmentDefaults(env: string): PartialConfig {
  switch (env) {
    case 'production':  return productionDefaults;
    case 'staging':     return stagingDefaults;
    case 'test':        return testDefaults;
    default:            return developmentDefaults;
  }
}
