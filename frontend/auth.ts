import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize() {
        // JWT is already set by /api/auth/login route
        // Validate it here for NextAuth session
        const cookieStore = await cookies();
        const token = cookieStore.get('jwt')?.value;

        if (!token) return null;

        try {
          const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'purpleVoid');
          const { payload } = await jwtVerify(token, secret);
          return {
            id: payload.user_id as string,
            email: payload.email as string,
            name: payload.username as string,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});
