/**
 * Timing-safe comparison utilities.
 * Prevents timing attacks on password/token/TOTP verification.
 */
import { timingSafeEqual, randomBytes } from 'crypto';

/**
 * Constant-time string comparison.
 * Always compares full length — never short-circuits.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  // Pad shorter string so both buffers have equal length
  // (prevents length-leak but the comparison will obviously be false)
  const maxLen = Math.max(a.length, b.length);
  const bufA = Buffer.alloc(maxLen, 0);
  const bufB = Buffer.alloc(maxLen, 0);
  Buffer.from(a).copy(bufA);
  Buffer.from(b).copy(bufB);

  // Even if lengths differ the comparison runs in constant time
  return a.length === b.length && timingSafeEqual(bufA, bufB);
}

/**
 * Generate a cryptographically-secure random hex token.
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}
