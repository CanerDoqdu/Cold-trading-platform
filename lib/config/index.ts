/**
 * ============================================
 * CENTRALIZED CONFIGURATION
 * ============================================
 * Single import for all config:
 *
 *   import { config } from '@/lib/config';
 *   config.mongoUri   // typed, validated
 *   config.nodeEnv    // 'development' | 'staging' | 'production' | 'test'
 *
 * Features:
 *  - Validates required vars at first access (fail fast)
 *  - Environment-specific defaults
 *  - Typed access (no more process.env.TYPO)
 *  - Lazy — doesn't run until first property access
 *
 * Same pattern: NestJS ConfigModule, Convict, dotenv-safe
 */

import { configSchema, type ConfigKey } from './schema';
import { environments, type Environment } from './environments';

// ─── Types ───

type ConfigValues = {
  [K in ConfigKey]: (typeof configSchema)[K] extends { transform: (v: string) => infer R }
    ? R
    : (typeof configSchema)[K] extends { default: infer D }
      ? D extends string ? string : D
      : string;
};

// ─── Builder ───

function buildConfig(): ConfigValues {
  const nodeEnv = (process.env.NODE_ENV || 'development') as Environment;
  const envDefaults = environments[nodeEnv] || {};
  const result: Record<string, unknown> = {};
  const missing: string[] = [];

  for (const [key, schema] of Object.entries(configSchema)) {
    const raw = process.env[schema.envKey];

    if (raw !== undefined && raw !== '') {
      // Env var is set — use it (with optional transform)
      result[key] = 'transform' in schema ? schema.transform(raw) : raw;
    } else if (key in envDefaults) {
      // Environment-specific default
      result[key] = envDefaults[key as keyof typeof envDefaults];
    } else if ('default' in schema) {
      // Schema default
      result[key] = schema.default;
    } else if (schema.required) {
      missing.push(`${schema.envKey} (${schema.description})`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((m) => `  - ${m}`).join('\n')}`
    );
  }

  return result as ConfigValues;
}

// ─── Singleton with Lazy Init ───

let _config: ConfigValues | null = null;

function getConfig(): ConfigValues {
  if (!_config) {
    _config = buildConfig();
  }
  return _config;
}

/**
 * Access config via proxy — lazy, typed, validated.
 *
 * @example
 * import { config } from '@/lib/config';
 * const uri = config.mongoUri; // string, validated
 */
export const config = new Proxy({} as ConfigValues, {
  get(_, prop: string) {
    return getConfig()[prop as ConfigKey];
  },
});

/** Re-export for barrel */
export { configSchema } from './schema';
export type { ConfigKey } from './schema';
export type { Environment } from './environments';
