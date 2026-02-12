import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

/**
 * GET /api/profile
 * Proxies profile requests to the api-gateway.
 * Requires a valid JWT cookie (private api-gateway route).
 */
export async function GET(request: NextRequest) {
  try {
    const publicId = request.nextUrl.searchParams.get('public_id');
    if (!publicId) {
      return NextResponse.json(
        { error: 'public_id is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');
    if (!jwt) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_GATEWAY_URL}/api/profile?public_id=${encodeURIComponent(publicId)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Cookie: `jwt=${jwt.value}`,
        },
        credentials: 'include',
        redirect: 'manual',
      }
    );

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      return NextResponse.json(
        { error: 'Unexpected response from backend.' },
        { status: 502 }
      );
    }
    if (!response.ok) {
      const backendError = Array.isArray(data?.error)
        ? data.error[0]
        : data?.error;
      return NextResponse.json(
        { error: backendError || 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Profile proxy error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
