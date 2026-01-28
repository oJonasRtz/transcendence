import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://api-gateway:3000';

/**
 * GET /api/history
 * Fetches match history for the authenticated user.
 * Requires a valid JWT cookie.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) {
      return NextResponse.json({ error: ['Unauthorized'] }, { status: 401 });
    }

    const userid = req.nextUrl.searchParams.get('userid') || '';

    const response = await fetch(`${API_GATEWAY_URL}/api/history?userid=${encodeURIComponent(userid)}`, {
      method: 'GET',
      headers: {
        Cookie: `jwt=${jwt}`,
      },
      credentials: 'include',
      redirect: 'manual',
    });

    const contentType = response.headers.get('content-type') || '';
    let data: any = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      return NextResponse.json({ error: 'Unexpected response from backend.' }, { status: 502 });
    }

    if (!response.ok) {
      const backendError = Array.isArray(data?.error) ? data.error[0] : data?.error;
      return NextResponse.json({ error: backendError || 'Failed to fetch history' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('history GET error:', err);
    return NextResponse.json({ error: [err.message] }, { status: 500 });
  }
}
