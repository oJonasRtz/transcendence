import type { NextAuthConfig } from 'next-auth';
import { NextRequest } from 'next/server';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }: { auth: any; request: NextRequest }) {
      // Check for JWT cookie (set by our custom login)
      const jwtToken = request.cookies.get('jwt')?.value;
      const isLoggedIn = !!auth?.user || !!jwtToken;
      const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && request.nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
