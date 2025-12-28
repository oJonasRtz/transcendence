'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

/**
 * Join the matchmaking queue
 */
export async function joinQueue() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    const response = await fetch(`${API_GATEWAY_URL}/match/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { error: 'Failed to join queue' };
    }

    return { success: true };
  } catch (error) {
    console.error('Join queue error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Leave the matchmaking queue
 */
export async function leaveQueue() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    const response = await fetch(`${API_GATEWAY_URL}/match/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { error: 'Failed to leave queue' };
    }

    return { success: true };
  } catch (error) {
    console.error('Leave queue error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
