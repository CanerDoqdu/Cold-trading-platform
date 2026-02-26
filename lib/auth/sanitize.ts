/**
 * MongoDB injection prevention.
 * Sanitises user-supplied objects before passing to Mongoose queries.
 *
 * Rejects keys starting with $ or containing . (dot-notation injection)
 * and prototype-pollution vectors (__proto__, constructor, prototype).
 */

const BANNED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Deep-sanitise an object for safe use in MongoDB queries.
 * Strips any key starting with `$`, containing `.`, or in BANNED_KEYS.
 * Returns a new plain object — never mutates the input.
 */
export function sanitizeQuery<T extends Record<string, unknown>>(
  input: T,
): Record<string, unknown> {
  const clean: Record<string, unknown> = Object.create(null);

  for (const [key, value] of Object.entries(input)) {
    // Block $ operators, dot-notation injection, prototype pollution
    if (key.startsWith('$') || key.includes('.') || BANNED_KEYS.has(key)) {
      continue; // silently drop dangerous keys
    }

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeQuery(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

/**
 * Quick check: does a value contain any MongoDB operator?
 * Useful as a guard before passing user input to find/update.
 */
export function containsOperator(value: unknown): boolean {
  if (typeof value === 'string') return value.startsWith('$');
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>).some(
      (k) => k.startsWith('$') || containsOperator((value as Record<string, unknown>)[k]),
    );
  }
  return false;
}
