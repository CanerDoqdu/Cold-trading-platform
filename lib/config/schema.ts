/**
 * ============================================
 * CONFIG SCHEMA & VALIDATION
 * ============================================
 * Single source of truth for ALL environment variables.
 * If a required var is missing → app crashes on startup (not at runtime).
 * 
 * Why:
 *  - No more scattered `process.env.X || 'fallback'` across 50 files
 *  - Typos caught at startup, not 3 AM in production
 *  - TypeScript autocompletion for every config value
 *  - Same pattern used by Stripe, Vercel, Linear
 */

export interface ConfigSchema {
  // ─── Environment ───
  nodeEnv: 'development' | 'staging' | 'production' | 'test';
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;

  // ─── Server ───
  port: number;
  baseUrl: string;

  // ─── Database ───
  mongoUri: string;
  mongoPoolSize: number;

  // ─── Auth / JWT ───
  jwtSecret: string;
  jwtExpiresIn: string;
  cookieMaxAge: number; // ms

  // ─── External APIs ───
  coingeckoBaseUrl: string;
  openSeaApiKey: string;
  openRouterApiKey: string;

  // ─── Rate Limiting ───
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;

  // ─── Cache ───
  cacheTTLDefault: number; // ms
  cacheMaxEntries: number;

  // ─── Logging ───
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  // ─── CORS ───
  allowedOrigins: string[];
}

/**
 * Define each env var: where it comes from, default, required?
 */
interface EnvVarDef<T> {
  envKey: string;
  default?: T;
  required?: boolean;
  transform?: (raw: string) => T;
}

// Registry of all env vars with their mappings
export const ENV_REGISTRY: Record<keyof ConfigSchema, EnvVarDef<any>> = {
  // ─── Environment ───
  nodeEnv: {
    envKey: 'NODE_ENV',
    default: 'development',
  },
  isProduction: {
    envKey: 'NODE_ENV',
    transform: (v) => v === 'production',
  },
  isDevelopment: {
    envKey: 'NODE_ENV',
    transform: (v) => v === 'development',
  },
  isTest: {
    envKey: 'NODE_ENV',
    transform: (v) => v === 'test',
  },

  // ─── Server ───
  port: {
    envKey: 'PORT',
    default: 3000,
    transform: (v) => parseInt(v, 10),
  },
  baseUrl: {
    envKey: 'NEXT_PUBLIC_BASE_URL',
    default: 'http://localhost:3000',
  },

  // ─── Database ───
  mongoUri: {
    envKey: 'MONGO_URI',
    required: true,
  },
  mongoPoolSize: {
    envKey: 'MONGO_POOL_SIZE',
    default: 20,
    transform: (v) => parseInt(v, 10),
  },

  // ─── Auth / JWT ───
  jwtSecret: {
    envKey: 'SECRET',
    required: true,
  },
  jwtExpiresIn: {
    envKey: 'JWT_EXPIRES_IN',
    default: '7d',
  },
  cookieMaxAge: {
    envKey: 'COOKIE_MAX_AGE',
    default: 7 * 24 * 60 * 60 * 1000,
    transform: (v) => parseInt(v, 10),
  },

  // ─── External APIs ───
  coingeckoBaseUrl: {
    envKey: 'COINGECKO_BASE_URL',
    default: 'https://api.coingecko.com/api/v3',
  },
  openSeaApiKey: {
    envKey: 'OPENSEA_API_KEY',
    default: '',
  },
  openRouterApiKey: {
    envKey: 'OPENROUTER_API_KEY',
    default: '',
  },

  // ─── Rate Limiting ───
  rateLimitWindowMs: {
    envKey: 'RATE_LIMIT_WINDOW_MS',
    default: 60_000,
    transform: (v) => parseInt(v, 10),
  },
  rateLimitMaxRequests: {
    envKey: 'RATE_LIMIT_MAX_REQUESTS',
    default: 100,
    transform: (v) => parseInt(v, 10),
  },

  // ─── Cache ───
  cacheTTLDefault: {
    envKey: 'CACHE_TTL_DEFAULT',
    default: 5 * 60 * 1000,
    transform: (v) => parseInt(v, 10),
  },
  cacheMaxEntries: {
    envKey: 'CACHE_MAX_ENTRIES',
    default: 500,
    transform: (v) => parseInt(v, 10),
  },

  // ─── Logging ───
  logLevel: {
    envKey: 'LOG_LEVEL',
    default: 'info',
  },

  // ─── CORS ───
  allowedOrigins: {
    envKey: 'ALLOWED_ORIGINS',
    default: ['http://localhost:3000'],
    transform: (v) => v.split(',').map((s) => s.trim()),
  },
};
