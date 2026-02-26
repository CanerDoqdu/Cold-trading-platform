/**
 * Request/Response logging middleware helper.
 * Produces structured JSON logs with sensitive fields redacted.
 */

import { logger } from '@/lib/logger';

const log = logger.child({ module: 'http' });

const REDACTED_FIELDS = new Set([
  'password',
  'newPassword',
  'currentPassword',
  'token',
  'code',
  'totpSecret',
  'secret',
  'refreshToken',
  'backupCodes',
]);

/** Shallow-redact sensitive fields from a plain object */
export function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = REDACTED_FIELDS.has(k) ? '[REDACTED]' : v;
  }
  return out;
}

export interface RequestLogEntry {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  userId?: string;
  requestId?: string;
  ip?: string;
}

export function logRequest(entry: RequestLogEntry) {
  const level = entry.status >= 500 ? 'error' : entry.status >= 400 ? 'warn' : 'info';
  log[level](`${entry.method} ${entry.path} ${entry.status}`, entry as unknown as Record<string, unknown>);
}
