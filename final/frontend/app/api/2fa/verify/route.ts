import { NextRequest } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

/**
 * POST /api/2fa/verify
 * 
 * Verifies the TOTP code from the user's authenticator app.
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

    // Get JWT cookie to authenticate with api-gateway
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    if (!jwt) {
      return Response.json({ 
        success: [], 
        error: ['Authentication token not found'] 
      }, { status: 401 });
    }

    // Call api-gateway endpoint
    const response = await fetch(`${API_GATEWAY_URL}/validate2FAQrCode`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `jwt=${jwt.value}`,
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
      success: data.success || ['2FA verified successfully!'],
      error: [],
    });
  } catch (error) {
    console.error('[API] Verify 2FA code error:', error);
    return Response.json({
      success: [],
      error: ['An unexpected error occurred. Please try again.'],
    }, { status: 500 });
  }
}
