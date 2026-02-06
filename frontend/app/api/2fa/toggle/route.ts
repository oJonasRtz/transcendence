import { NextRequest } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

/**
 * POST /api/2fa/toggle
 * 
 * Toggles Two-Factor Authentication on or off for the user.
 * Returns the new state of 2FA.
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
    const response = await fetch(`${API_GATEWAY_URL}/set2FAOnOff`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `jwt=${jwt.value}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        success: [],
        error: data.error || ['Failed to toggle 2FA'],
        enabled: false,
      }, { status: response.status });
    }

    return Response.json({
      success: data.success || ['2FA status updated'],
      error: [],
      enabled: data.enabled || false,
      message: data.message,
    });
  } catch (error) {
    console.error('[API] Toggle 2FA error:', error);
    return Response.json({
      success: [],
      error: ['An unexpected error occurred. Please try again.'],
      enabled: false,
    }, { status: 500 });
  }
}
