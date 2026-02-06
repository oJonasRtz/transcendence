import { NextResponse } from 'next/server';
import { passwordRegex } from '@/app/lib/validations';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

export async function POST(request: Request) {
  try {
    const { email, token, password, confirmPassword } = await request.json();

    if (!email || !token || !password || !confirmPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: 'Password must have numbers, letters, special characters' },
        { status: 400 }
      );
    }

    // Call the backend apiNewPassword endpoint (stateless API version)
    const response = await fetch(`${API_GATEWAY_URL}/api/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
        password,
        confirmPassword
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: data.error || 'Failed to reset password'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: data.success?.[0] || 'Password updated successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
