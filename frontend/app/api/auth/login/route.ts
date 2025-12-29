import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway:3000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const captchaInput = formData.get('captchaInput');

    // Validate captcha
    const storedCaptcha = request.cookies.get('captcha_code')?.value;
    if (!storedCaptcha || captchaInput?.toString().toLowerCase() !== storedCaptcha.toLowerCase()) {
      return NextResponse.json({ error: ['Invalid captcha'] }, { status: 400 });
    }

    // Call api-gateway (which proxies to auth-service)
    const res = await fetch(`${API_GATEWAY_URL}/api/checkLogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, captchaInput }),
    });

    const data = await res.json();

    if (data.token) {
      const response = NextResponse.json({ success: true, redirectTo: '/dashboard' });
      response.cookies.set('jwt', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600, // 1 hour
        path: '/',
      });
      response.cookies.delete('captcha_code');
      return response;
    }

    return NextResponse.json({ error: data.error || ['Login failed'] }, { status: res.status });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: ['An error occurred during login'] }, { status: 500 });
  }
}
