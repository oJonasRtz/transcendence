import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Get the pending 2FA token from cookie
    const cookieStore = await cookies();
    const pendingToken = cookieStore.get('pending_2fa_token');

    if (!pendingToken) {
      return NextResponse.json(
        { error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    // Call the backend to verify the 2FA code
    const response = await fetch(`${API_GATEWAY_URL}/verifyLogin2FA`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tempToken: pendingToken.value,
        code: code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Invalid verification code' },
        { status: response.status }
      );
    }

    // 2FA verified successfully - set the JWT cookie
    if (data.token) {
      cookieStore.set('jwt', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      // Clear the pending token
      cookieStore.delete('pending_2fa_token');

      // Sync user to Prisma
      try {
        const { getUser } = await import('@/app/lib/auth');
        const { getUserProfile } = await import('@/app/lib/backend-api');
        const { syncUserToPrisma } = await import('@/app/lib/sync');

        const authUser = await getUser();

        if (authUser && authUser.public_id) {
          const backendUser = await getUserProfile(authUser.public_id);

          if (backendUser) {
            await syncUserToPrisma(backendUser, authUser.email);
            console.log('[Auth] User synced to Prisma after 2FA:', authUser.email);
          }
        }
      } catch (prismaError) {
        console.error('[Auth] Failed to sync user to Prisma:', prismaError);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}
