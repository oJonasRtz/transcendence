import { NextRequest } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

/**
 * GET /api/user/verification-status
 * 
 * Returns the user's email verification and 2FA status.
 * Returns: { isEmailVerified: boolean, has2FA: boolean }
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ 
        success: [], 
        error: ['Unauthorized - Please log in'],
        isEmailVerified: false,
        has2FA: false,
      }, { status: 401 });
    }

    // Get JWT cookie to authenticate with api-gateway
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    if (!jwt) {
      return Response.json({ 
        success: [], 
        error: ['Authentication token not found'],
        isEmailVerified: false,
        has2FA: false,
      }, { status: 401 });
    }

    // Call api-gateway endpoint
    const response = await fetch(`${API_GATEWAY_URL}/getVerificationStatus`, {
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
        error: data.error || ['Failed to get verification status'],
        isEmailVerified: false,
        has2FA: false,
      }, { status: response.status });
    }

    // Normalize numeric values (0/1) to booleans
    return Response.json({
      success: data.success || ['Status retrieved successfully'],
      error: [],
      isEmailVerified: data.isEmailVerified === true || data.isEmailVerified === 1,
      has2FA: data.has2FA === true || data.has2FA === 1,
    });
  } catch (error) {
    console.error('[API] Get verification status error:', error);
    return Response.json({
      success: [],
      error: ['An unexpected error occurred. Please try again.'],
      isEmailVerified: false,
      has2FA: false,
    }, { status: 500 });
  }
}
