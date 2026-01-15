import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required for frontend middleware');
}

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/messages', '/friends', '/settings', '/matchmaking'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt'); // Changed from 'token' to 'jwt'

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current route is an auth route (login/signup)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Verify token if it exists
  let isAuthenticated = false;
  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token.value, secret);
      isAuthenticated = true;
    } catch (error) {
      console.error('JWT verification failed in middleware:', error);
      isAuthenticated = false;
    }
  }

  // Redirect to login if trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard only for GET requests on auth routes.
  // Server actions use POST and must not be redirected.
  if (isAuthRoute && isAuthenticated && request.method === 'GET') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
