import { NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

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

    // Verify the reset token
    if (!verifyResetToken(token, email)) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    // Call the backend apiNewPassword endpoint (stateless API version)
    const response = await fetch(`${API_GATEWAY_URL}/apiNewPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        confirmPassword
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: data.error?.[0] || 'Failed to reset password'
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

// Verify the reset token (simple implementation)
function verifyResetToken(token: string, email: string): boolean {
  try {
    const decoded = atob(token);
    const [tokenEmail, timestamp, _] = decoded.split(':');
    
    // Check if email matches
    if (tokenEmail !== email) {
      return false;
    }
    
    // Check if token is not older than 1 hour (3600000ms)
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    return (now - tokenTime) < oneHour;
  } catch {
    return false;
  }
}