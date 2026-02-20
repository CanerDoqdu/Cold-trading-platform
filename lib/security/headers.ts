/**
 * ============================================
 * SECURITY HEADERS MIDDLEWARE
 * ============================================
 * Defense-in-depth HTTP headers applied to EVERY response.
 *
 * Each header prevents a specific class of attack:
 *  - CSP: blocks inline scripts / unauthorized resources → XSS
 *  - HSTS: forces HTTPS → MITM
 *  - X-Content-Type-Options: prevents MIME sniffing → drive-by downloads
 *  - X-Frame-Options: prevents clickjacking → UI redress
 *  - Referrer-Policy: limits referrer leakage → privacy
 *  - Permissions-Policy: disables dangerous browser APIs
 *
 * Why here (not just next.config)?
 *  - next.config headers only apply to matched routes
 *  - This applies to ALL responses including API, middleware, errors
 *  - Easier to test and audit in one place
 *
 * Same approach: Helmet.js (Express), Cloudflare, GitHub
 */

import { NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  /** Enable HSTS (only in production) */
  hsts?: boolean;
  /** Enable Content-Security-Policy */
  csp?: boolean;
  /** Custom CSP directives (merged with defaults) */
  cspDirectives?: Record<string, string>;
  /** Referrer policy */
  referrerPolicy?: string;
  /** X-Frame-Options value */
  frameOptions?: string;
}

const DEFAULT_CONFIG: Required<SecurityHeadersConfig> = {
  hsts: process.env.NODE_ENV === 'production',
  csp: true,
  cspDirectives: {},
  referrerPolicy: 'strict-origin-when-cross-origin',
  frameOptions: 'DENY',
};

/**
 * Apply security headers to a response.
 */
export function applySecurityHeaders(
  response: NextResponse,
  config?: SecurityHeadersConfig,
): NextResponse {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // ── Prevent MIME sniffing ──
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // ── Prevent clickjacking ──
  response.headers.set('X-Frame-Options', cfg.frameOptions);

  // ── XSS filter (legacy browsers) ──
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // ── Limit referrer leakage ──
  response.headers.set('Referrer-Policy', cfg.referrerPolicy);

  // ── Disable dangerous browser features ──
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
  );

  // ── Force HTTPS (production only) ──
  if (cfg.hsts) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  // ── Content Security Policy ──
  if (cfg.csp) {
    const defaultDirectives: Record<string, string> = {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval'",
      'style-src': "'self' 'unsafe-inline'",
      'img-src': "'self' data: https: blob:",
      'font-src': "'self' data:",
      'connect-src': "'self' https://api.coingecko.com https://api.opensea.io wss: ws:",
      'frame-ancestors': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
    };

    const merged = { ...defaultDirectives, ...cfg.cspDirectives };
    const cspString = Object.entries(merged)
      .map(([key, value]) => `${key} ${value}`)
      .join('; ');

    response.headers.set('Content-Security-Policy', cspString);
  }

  // ── Prevent search engine caching of sensitive pages ──
  // (API routes should not be indexed)
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  return response;
}
