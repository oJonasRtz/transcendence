import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:3000';

/**
 * POST /api/email/send-verification
 * 
 * Sends a verification code to the user's email address.
 * The code is stored in the session and expires after 5 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ 
        success: [], 
        error: ['Unauthorized - Please log in'] 
      }, { status: 401 });
    }

    // Get cookies to authenticate with api-gateway
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');
    const sessionCookie = cookieStore.get('session');

    if (!jwt) {
      return Response.json({ 
        success: [], 
        error: ['Authentication token not found'] 
      }, { status: 401 });
    }

    // Build cookie header with both jwt and session (if exists)
    let cookieHeader = `jwt=${jwt.value}`;
    if (sessionCookie) {
      cookieHeader += `; session=${sessionCookie.value}`;
    }

    // Call api-gateway endpoint
    const response = await fetch(`${API_GATEWAY_URL}/confirmUserEmail`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Get the session cookie from api-gateway response and pass it to the client
    const setCookieHeader = response.headers.get('set-cookie');
    
    if (!response.ok) {
      return Response.json({
        success: [],
        error: data.error || ['Failed to send verification code'],
      }, { status: response.status });
    }

    // Create response with the session cookie forwarded
    const jsonResponse = NextResponse.json({
      success: data.success || ['Verification code sent to your email'],
      error: [],
    });

    // Forward the session cookie from api-gateway to the browser
    if (setCookieHeader) {
      jsonResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return jsonResponse;
  } catch (error) {
    console.error('[API] Send verification error:', error);
    return Response.json({
      success: [],
      error: ['An unexpected error occurred. Please try again.'],
    }, { status: 500 });
  }
}
