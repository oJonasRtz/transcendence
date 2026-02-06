import { NextRequest } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

/**
 * POST /api/email/verify-code
 * 
 * Verifies the email verification code entered by the user.
 * Body: { code: string }
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

    // Parse request body
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return Response.json({
        success: [],
        error: ['Verification code is required'],
      }, { status: 400 });
    }

    // Get cookies to authenticate with api-gateway
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    if (!jwt) {
      return Response.json({ 
        success: [], 
        error: ['Authentication token not found'] 
      }, { status: 401 });
    }

    // Build cookie header with jwt only
    const cookieHeader = `jwt=${jwt.value}`;

    // Call api-gateway JSON endpoint
    const response = await fetch(`${API_GATEWAY_URL}/api/email/verify-code`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify({ code }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        success: [],
        error: data.error || ['Invalid verification code'],
      }, { status: response.status });
    }

    return Response.json({
      success: data.success || ['Email verified successfully!'],
      error: [],
    });
  } catch (error) {
    console.error('[API] Verify code error:', error);
    return Response.json({
      success: [],
      error: ['An unexpected error occurred. Please try again.'],
    }, { status: 500 });
  }
}
