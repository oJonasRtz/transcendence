import { NextResponse } from 'next/server';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Call the backend apiCheckEmailCode endpoint
    const response = await fetch(`${API_GATEWAY_URL}/api/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: data.error || 'Invalid verification code' 
      }, { status: response.status });
    }

    return NextResponse.json({ 
      success: true, 
      message: data.success?.[0] || 'Code verified successfully',
      token: data.token
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
