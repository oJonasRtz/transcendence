import { NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway:3000';

export async function GET() {
  try {
    const res = await fetch(`${API_GATEWAY_URL}/getCaptcha`);
    const data = await res.json();
    // data = { code: string, data: "data:image/svg+xml;base64,..." }

    const response = NextResponse.json({ image: data.data });
    // Store captcha code in cookie for validation
    response.cookies.set('captcha_code', data.code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 300, // 5 minutes
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch captcha:', error);
    return NextResponse.json({ error: 'Failed to fetch captcha' }, { status: 500 });
  }
}
