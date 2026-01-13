import { NextRequest } from 'next/server';
import { getUser } from '@/app/lib/auth';
import { cookies } from 'next/headers';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'http://localhost:3000';

/**
 * GET /api/2fa/qr-code
 * 
 * Generates and returns the QR code for setting up 2FA.
 * User must have 2FA enabled first.
 */
export async function GET(request: NextRequest) {
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
    const response = await fetch(`${API_GATEWAY_URL}/get2FAQrCode`, {
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
        error: data.error || ['Failed to generate QR code'],
      }, { status: response.status });
    }

    return Response.json({
      success: data.success || ['QR code generated successfully'],
      error: [],
      qrCodeDataURL: data.qrCodeDataURL || null,
      image: data.image || null,
    });
  } catch (error) {
    console.error('[API] Get QR code error:', error);
    return Response.json({
      success: [],
      error: ['An unexpected error occurred. Please try again.'],
    }, { status: 500 });
  }
}
