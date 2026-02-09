import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { rateLimiter, getClientIP, getProfileForPath } from "@/lib/rateLimit";

// All routes that require authentication
const protectedRoutes = [
  "/profile",
  "/profile/explore", 
  "/profile/account-info",
  "/dashboard",
  "/account-info",
];


export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessionCookie = req.cookies.get("token")?.value;
  
  // Auth pages that logged-in users shouldn't access
  const authPages = ["/login", "/signup"];
  const isAuthPage = authPages.includes(path);
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  // Create response with CORS headers for API routes
  let response = NextResponse.next();
  
  // ============================================
  // RATE LIMITING — runs on all API routes
  // ============================================
  if (path.startsWith("/api")) {
    // Handle CORS preflight immediately (don't rate limit OPTIONS)
    if (req.method === 'OPTIONS') {
      const preflightResponse = new NextResponse(null, { status: 204 });
      setCORSHeaders(preflightResponse, req);
      return preflightResponse;
    }

    // Rate limit check
    const clientIP = getClientIP(req);
    const profile = getProfileForPath(path);
    const rateLimitKey = `${clientIP}:${path.split('/').slice(0, 3).join('/')}`; // Group by route prefix
    const result = rateLimiter.check(rateLimitKey, profile);

    if (!result.allowed) {
      // 429 Too Many Requests — the internet's "slow down" signal
      const blockedResponse = NextResponse.json(
        { 
          error: 'Too Many Requests',
          message: profile.message,
          retryAfter: result.retryAfter,
        },
        { status: 429 }
      );
      blockedResponse.headers.set('Retry-After', String(result.retryAfter));
      blockedResponse.headers.set('X-RateLimit-Limit', String(result.limit));
      blockedResponse.headers.set('X-RateLimit-Remaining', '0');
      blockedResponse.headers.set('X-RateLimit-Reset', String(result.resetTime));
      setCORSHeaders(blockedResponse, req);
      return blockedResponse;
    }

    // Attach rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(result.resetTime));
    
    // CORS headers
    setCORSHeaders(response, req);
    
    return response;
  }
  
  // ============================================
  // AUTH LOGIC — runs on page routes
  // ============================================
  
  // If user doesn't have a session cookie
  if (!sessionCookie) {
    // Redirect to login if trying to access protected routes
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    // Allow access to auth pages
    return response;
  }
  
  // If user has a session cookie, verify it
  const session = await verifySession(sessionCookie);
  
  // If session is valid and user tries to access auth pages, redirect to home
  if (session?._id && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  
  // If session is invalid and trying to access protected routes
  if (!session?._id && isProtectedRoute) {
    // Clear the invalid cookie
    const redirectResponse = NextResponse.redirect(new URL("/login", req.nextUrl));
    redirectResponse.cookies.delete("token");
    return redirectResponse;
  }

  return response;
}

// ============================================
// CORS HELPER
// ============================================
function setCORSHeaders(response: NextResponse, req: NextRequest) {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    'https://api.coingecko.com',
    'https://api.opensea.io',
    'https://openrouter.ai',
  ];
  
  const origin = req.headers.get('origin') || '';
  const isAllowedOrigin = allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development';
  
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
}

export const config = {
  // NOW includes /api routes (previously they were excluded!)
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};
