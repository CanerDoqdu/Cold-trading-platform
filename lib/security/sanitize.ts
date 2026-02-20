/**
 * ============================================
 * OUTPUT SANITIZATION
 * ============================================
 * Strips sensitive/dangerous data from API responses.
 *
 * Why:
 *  - MongoDB can leak __v, password hashes, internal IDs
 *  - Stack traces / error internals should never reach client
 *  - XSS payloads stored in DB can execute when rendered
 *
 * Usage:
 *   import { sanitizeOutput, sanitizeUser } from '@/lib/security/sanitize';
 *
 *   return NextResponse.json(sanitizeUser(user));
 *
 * Same approach: GitHub API (never returns password hashes)
 */

// Fields that must NEVER appear in any API response
const GLOBAL_BLOCKED_FIELDS = new Set([
  'password',
  '__v',
  'refreshToken',
  'resetToken',
  'resetTokenExpiry',
]);

/**
 * Recursively strip blocked fields from an object.
 * Handles nested objects and arrays.
 */
export function sanitizeOutput<T extends Record<string, any>>(
  data: T,
  blockedFields: Set<string> = GLOBAL_BLOCKED_FIELDS,
): Partial<T> {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeOutput(item, blockedFields)) as any;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (blockedFields.has(key)) continue;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeOutput(value, blockedFields);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' ? sanitizeOutput(item, blockedFields) : item,
      );
    } else {
      result[key] = value;
    }
  }

  return result as Partial<T>;
}

/**
 * Sanitize a user object for public API responses.
 * Only includes safe, expected fields.
 */
export function sanitizeUser(user: any): {
  _id: string;
  name: string;
  email: string;
} {
  if (!user) return user;

  return {
    _id: String(user._id),
    name: String(user.name || ''),
    email: String(user.email || ''),
  };
}

/**
 * Escape HTML entities in a string to prevent XSS.
 * Use when rendering user-generated content.
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Strip HTML tags entirely from a string.
 * For cases where you want plain text only.
 */
export function stripHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}
