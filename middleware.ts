import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";

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
  
  if (path.startsWith("/api")) {
    // CORS headers for API routes
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

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
