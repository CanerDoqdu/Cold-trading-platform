/**
 * ============================================
 * ENVIRONMENT VARIABLE SCHEMA REGISTRY
 * ============================================
 * Single source of truth for every env var the app reads.
 *
 * Why a schema?
 *  - Documents every variable (no grep through codebase)
 *  - Validates at startup (fail fast, not at 3 AM)
 *  - Type-safe access with defaults
 *  - Same pattern: NestJS ConfigModule, Rails credentials
 *
 * Adding a new env var:
 *  1. Add entry here with envKey, required, default, transform
 *  2. Access via config.yourKey — done
 */

export interface ConfigEntry<T = string> {
  /** The actual process.env key name */
  envKey: string;
  /** Is it required? Startup crashes if missing & no default */
  required: boolean;
  /** Default value when not set */
  default?: T;
  /** Transform from string to target type */
  transform?: (raw: string) => T;
  /** Human-readable description */
  description: string;
}

// ─── Schema ───

export const configSchema = {
  // ── Core ──
  nodeEnv: {
    envKey: 'NODE_ENV',
    required: false,
    default: 'development',
    description: 'Runtime environment',
  },
  port: {
    envKey: 'PORT',
    required: false,
    default: 3000,
    transform: (v: string) => parseInt(v, 10),
    description: 'Server port',
  },
  baseUrl: {
    envKey: 'NEXT_PUBLIC_BASE_URL',
    required: false,
    default: 'http://localhost:3000',
    description: 'Public base URL for the app',
  },

  // ── Database ──
  mongoUri: {
    envKey: 'MONGO_URI',
    required: true,
    description: 'MongoDB connection string',
  },
  mongoPoolSize: {
    envKey: 'MONGO_POOL_SIZE',
    required: false,
    default: 20,
    transform: (v: string) => parseInt(v, 10),
    description: 'Max MongoDB connection pool size',
  },

  // ── Auth / Secrets ──
  jwtSecret: {
    envKey: 'SECRET',
    required: true,
    description: 'JWT signing secret (legacy routes)',
  },
  jwtSecretAlt: {
    envKey: 'JWT_SECRET',
    required: false,
    default: '',
    description: 'JWT secret for jose-based routes (notifications, price-alerts)',
  },

  // ── External APIs ──
  coingeckoBaseUrl: {
    envKey: 'COINGECKO_BASE_URL',
    required: false,
    default: 'https://api.coingecko.com/api/v3',
    description: 'CoinGecko API base URL',
  },
  openSeaApiKey: {
    envKey: 'OPENSEA_API_KEY',
    required: false,
    default: '',
    description: 'OpenSea API key',
  },
  cryptoCompareKey: {
    envKey: 'CRYPTOCOMPARE',
    required: false,
    default: '',
    description: 'CryptoCompare API key (server-side)',
  },
  openRouterApiKey: {
    envKey: 'OPENROUTER_API_KEY',
    required: false,
    default: '',
    description: 'OpenRouter API key for chat',
  },

  // ── Google OAuth ──
  googleClientId: {
    envKey: 'GOOGLE_CLIENT_ID',
    required: false,
    default: '',
    description: 'Google OAuth client ID',
  },

  // ── Reddit ──
  redditClientId: {
    envKey: 'REDDIT_CLIENT_ID',
    required: false,
    default: '',
    description: 'Reddit API client ID',
  },
  redditClientSecret: {
    envKey: 'REDDIT_CLIENT_SECRET',
    required: false,
    default: '',
    description: 'Reddit API client secret',
  },

  // ── Cache ──
  cacheTTLDefault: {
    envKey: 'CACHE_TTL_DEFAULT',
    required: false,
    default: 300_000,
    transform: (v: string) => parseInt(v, 10),
    description: 'Default cache TTL in milliseconds',
  },
} as const satisfies Record<string, ConfigEntry<any>>;

/** All config keys as a union type */
export type ConfigKey = keyof typeof configSchema;
