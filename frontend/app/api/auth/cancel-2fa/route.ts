import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the pending 2FA token
    cookieStore.delete('pending_2fa_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel 2FA error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
