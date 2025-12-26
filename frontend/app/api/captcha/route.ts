import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use API gateway instead of direct auth-service (Docker internal hostname)
const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

/**
 * GET /api/captcha
 * Fetches a new CAPTCHA from auth-service and returns it to the client
 * The CAPTCHA code is stored in a temporary cookie for validation
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch CAPTCHA from api-gateway (which forwards to auth-service)
    const response = await fetch(`${API_GATEWAY_URL}/getCaptcha`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to generate CAPTCHA' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const { code, data: imageData } = data;

    // Store the CAPTCHA code in a temporary cookie (5 minutes expiry)
    const cookieStore = await cookies();
    cookieStore.set('captcha_code', code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 5 * 60, // 5 minutes
    });

    // Return only the image data to the client (not the answer!)
    return NextResponse.json({
      image: imageData,
    });
  } catch (error) {
    console.error('Error generating CAPTCHA');
    return NextResponse.json(
      { error: 'Failed to generate CAPTCHA' },
      { status: 500 }
    );
  }
}
