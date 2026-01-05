import { NextRequest } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

/**
 * GET /api/2fa/status
 * 
 * Returns the current 2FA status for the user.
 * Returns: { enabled: boolean, validated: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ 
        success: [], 
        error: ['Unauthorized - Please log in'],
        enabled: false,
        validated: false,
      }, { status: 401 });
    }

    // Get JWT cookie to authenticate with api-gateway
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    if (!jwt) {
      return Response.json({ 
        success: [], 
        error: ['Authentication token not found'],
        enabled: false,
        validated: false,
      }, { status: 401 });
    }

    // Call api-gateway endpoint to get verification status
    const response = await fetch(`${API_GATEWAY_URL}/getVerificationStatus`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': `jwt=${jwt.value}`,
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({
        success: [],
        error: data.error || ['Failed to get 2FA status'],
        enabled: false,
        validated: false,
      }, { status: response.status });
    }

    return Response.json({
      success: data.success || ['Status retrieved successfully'],
      error: [],
      enabled: data.has2FA || false,
      validated: false, // This would need additional backend support
    });
  } catch (error) {
    console.error('[API] Get 2FA status error:', error);
    return Response.json({
      success: [],
      error: ['An unexpected error occurred. Please try again.'],
      enabled: false,
      validated: false,
    }, { status: 500 });
  }
}
