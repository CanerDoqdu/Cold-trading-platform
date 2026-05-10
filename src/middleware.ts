import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/dal';
import { rateLimiter, getClientIP, getProfileForPath } from '@/lib/rateLimit';

// ── Protected routes ───────────────────
const protectedRoutes = [
  '/profile',
  '/profile/explore',
  '/profile/account-info',
  '/dashboard',
  '/account-info',
];

const authPages = ['/login', '/signup'];

// ── Build CSP header ───────────────────
function buildCSP(nonce: string): string {
  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://s3.tradingview.com https://accounts.google.com https://apis.google.com`,
    `style-src 'self' 'unsafe-inline' https://accounts.google.com`,
    `img-src 'self' data: https:`,
    `connect-src 'self' wss://stream.binance.com wss://stream.binance.com:9443 wss://streamer.cryptocompare.com https://api.coingecko.com https://pro-api.coingecko.com https://api.opensea.io https://min-api.cryptocompare.com https://openrouter.ai https://accounts.google.com`,
    `frame-src https://s.tradingview.com https://www.tradingview-widget.com https://accounts.google.com`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];
  return directives.join('; ');
}

// ── CORS ───────────────────────────────
const PRODUCTION_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
];

function setCORSHeaders(response: NextResponse, req: NextRequest) {
  const origin = req.headers.get('origin') || '';
  const isDev = process.env.NODE_ENV === 'development';
  const isAllowed =
    PRODUCTION_ORIGINS.includes(origin) ||
    (isDev && origin.startsWith('http://localhost'));

  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Request-ID, X-CSRF-Token',
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
}

// ── Security headers ───────────────────
function setSecurityHeaders(response: NextResponse, nonce: string) {
  response.headers.set('Content-Security-Policy', buildCSP(nonce));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );
  response.headers.set('X-XSS-Protection', '0'); // CSP supersedes; 0 avoids old-IE bugs
}

// ── CSRF validation (double-submit cookie) ──
function validateCSRF(req: NextRequest): boolean {
  const method = req.method;
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;

  const csrfCookie = req.cookies.get('csrf-token')?.value;
  const csrfHeader = req.headers.get('x-csrf-token');

  // If no CSRF cookie exists yet, skip (will be issued via page response)
  if (!csrfCookie) return true;

  return !!csrfHeader && csrfHeader === csrfCookie;
}

// ── Content-Type enforcement for API mutations ──
function hasValidContentType(req: NextRequest): boolean {
  const method = req.method;
  if (['GET', 'HEAD', 'OPTIONS', 'DELETE'].includes(method)) return true;

  const contentType = req.headers.get('content-type') || '';
  return contentType.includes('application/json');
}

// ── Nonce generation (Edge-compatible) ──
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// ════════════════════════════════════════
// MAIN MIDDLEWARE
// ════════════════════════════════════════
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const nonce = generateNonce();
  const requestId = crypto.randomUUID();
  const sessionCookie = req.cookies.get('token')?.value;
  const isAuthPage = authPages.includes(path);
  const isProtectedRoute = protectedRoutes.some((r) => path.startsWith(r));

  // ── API routes ──────────────────────
  if (path.startsWith('/api')) {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      const preflight = new NextResponse(null, { status: 204 });
      setCORSHeaders(preflight, req);
      return preflight;
    }

    // Content-Type check (POST/PUT must be application/json)
    if (!hasValidContentType(req)) {
      const resp = NextResponse.json(
        {
          version: 'v1',
          ok: false,
          error: {
            code: 'INVALID_CONTENT_TYPE',
            message: 'Content-Type must be application/json',
          },
        },
        { status: 415 },
      );
      setCORSHeaders(resp, req);
      return resp;
    }

    // CSRF check for v1 mutating endpoints
    if (path.startsWith('/api/v1') && !validateCSRF(req)) {
      const resp = NextResponse.json(
        {
          version: 'v1',
          ok: false,
          error: { code: 'CSRF_FAILED', message: 'Invalid CSRF token' },
        },
        { status: 403 },
      );
      setCORSHeaders(resp, req);
      return resp;
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    const profile = getProfileForPath(path);
    const rateLimitKey = `${clientIP}:${path.split('/').slice(0, 3).join('/')}`;
    const result = rateLimiter.check(rateLimitKey, profile);

    if (!result.allowed) {
      const blocked = NextResponse.json(
        {
          error: 'Too Many Requests',
          message: profile.message,
          retryAfter: result.retryAfter,
        },
        { status: 429 },
      );
      blocked.headers.set('Retry-After', String(result.retryAfter));
      blocked.headers.set('X-RateLimit-Limit', String(result.limit));
      blocked.headers.set('X-RateLimit-Remaining', '0');
      blocked.headers.set('X-RateLimit-Reset', String(result.resetTime));
      setCORSHeaders(blocked, req);
      return blocked;
    }

    const response = NextResponse.next();
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.resetTime));
    setCORSHeaders(response, req);
    return response;
  }

  // ── Page routes ─────────────────────
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security + tracing headers on every page response
  setSecurityHeaders(response, nonce);
  response.headers.set('x-nonce', nonce);
  response.headers.set('X-Request-ID', requestId);

  // Issue CSRF cookie if missing
  if (!req.cookies.get('csrf-token')) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const csrfToken = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: false, // JS reads it to send in X-CSRF-Token header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 h
    });
  }

  // ── Auth logic ──────────────────────
  if (!sessionCookie) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
    return response;
  }

  const session = await verifySession(sessionCookie);

  if (session?._id && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  if (!session?._id && isProtectedRoute) {
    const redirect = NextResponse.redirect(new URL('/login', req.nextUrl));
    redirect.cookies.delete('token');
    return redirect;
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
};
