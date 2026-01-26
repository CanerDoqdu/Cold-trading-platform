import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";

const protectedRoutes = ["/dashboard", "/profile", "/account-info"];


export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessionCookie = req.cookies.get("token")?.value;
  
  // Auth pages that logged-in users shouldn't access
  const authPages = ["/login", "/signup"];
  const isAuthPage = authPages.includes(path);
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  
  // If user doesn't have a session cookie
  if (!sessionCookie) {
    // Redirect to login if trying to access protected routes
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    // Allow access to auth pages
    return NextResponse.next();
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
    const response = NextResponse.redirect(new URL("/login", req.nextUrl));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
