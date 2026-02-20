/**
 * ============================================
 * CENTRALIZED CONFIG — SINGLE IMPORT
 * ============================================
 * Usage:  import { config } from '@/lib/config';
 *         config.mongoUri   // typed, validated, ready
 *
 * Priority: env var → environment defaults → schema defaults
 * If a required var is missing → throws on first access (fail fast).
 *
 * Same pattern: Stripe SDK, Vercel CLI, Linear backend
 */

import { ConfigSchema, ENV_REGISTRY } from './schema';
import { getEnvironmentDefaults } from './environments';

let _config: ConfigSchema | null = null;
const _warnings: string[] = [];

function buildConfig(): ConfigSchema {
  const rawEnv = process.env.NODE_ENV || 'development';
  const envDefaults = getEnvironmentDefaults(rawEnv);
  const result: Record<string, any> = {};

  for (const [key, def] of Object.entries(ENV_REGISTRY)) {
    const rawValue = process.env[def.envKey];

    if (rawValue !== undefined && rawValue !== '') {
      // Env var exists → use it (with optional transform)
      result[key] = def.transform ? def.transform(rawValue) : rawValue;
    } else if (key in envDefaults) {
      // Environment-specific default
      result[key] = (envDefaults as any)[key];
    } else if (def.default !== undefined) {
      // Schema default
      result[key] = def.default;
    } else if (def.required) {
      // Required but missing → fatal in production, warning in dev
      if (rawEnv === 'production') {
        throw new Error(
          `[CONFIG] Missing required env var: ${def.envKey} (config key: ${key})`
        );
      }
      _warnings.push(`Missing required env var: ${def.envKey} (config key: ${key})`);
      result[key] = '';
    } else {
      result[key] = undefined;
    }
  }

  return result as ConfigSchema;
}

/**
 * Get the validated, typed config singleton.
 * Builds lazily on first access, then cached.
 */
export function getConfig(): ConfigSchema {
  if (!_config) {
    _config = buildConfig();

    // Log warnings in dev
    if (_warnings.length > 0 && _config.nodeEnv !== 'test') {
      console.warn('[CONFIG] ⚠ Warnings during config build:');
      _warnings.forEach((w) => console.warn(`  → ${w}`));
    }
  }
  return _config;
}

/**
 * Direct export for convenience.
 * import { config } from '@/lib/config';
 */
export const config = new Proxy({} as ConfigSchema, {
  get(_, prop: string) {
    return getConfig()[prop as keyof ConfigSchema];
  },
});

/**
 * Reset config (for testing only)
 */
export function resetConfig(): void {
  _config = null;
  _warnings.length = 0;
}

// Re-export types
export type { ConfigSchema } from './schema';
