import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Use API gateway instead of direct auth-service (Docker internal hostname)
const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

/**
 * GET /api/captcha
 * Fetches a new CAPTCHA from auth-service and returns it to the client
 * The CAPTCHA code is stored in a temporary cookie for validation
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch CAPTCHA from api-gateway (which forwards to auth-service)
    const response = await fetch(`${API_GATEWAY_URL}/api/captcha`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to generate CAPTCHA' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const { captchaId, image } = data;

    // Store the CAPTCHA id in a temporary cookie (5 minutes expiry)
    const cookieStore = await cookies();
    cookieStore.set('captcha_id', captchaId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 5 * 60, // 5 minutes
    });

    // Return only the image data to the client
    return NextResponse.json({
      image,
    });
  } catch (error) {
    console.error('Error generating CAPTCHA');
    return NextResponse.json(
      { error: 'Failed to generate CAPTCHA' },
      { status: 500 }
    );
  }
}
