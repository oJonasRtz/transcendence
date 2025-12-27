'use server';

import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * Hybrid Approach Backend API
 *
 * These server actions fetch data from the SQLite backend microservices.
 * Used when we need fresh data that isn't synced to Prisma.
 */

/**
 * Backend User type returned from SQLite microservices
 * 
 * Note: email is optional because /seeProfile endpoint doesn't include it.
 * Only /seeAllUsers might include it depending on the SQLite query.
 * Note: SQLite stores booleans as integers (0/1).
 */
interface BackendUser {
  user_id: string;
  username: string;
  nickname: string;
  email?: string; // Optional - not always returned
  avatar: string;
  isOnline: number | boolean; // SQLite returns 0/1
  inQueue: number | boolean;
  inGame: number | boolean;
  rank: number;
  public_id: string;
  title: string;
  description: string | null;
  friends: number;
  wins: number;
  losses: number;
  experience_points: number;
  created_at: string;
  updated_at: string;
}

interface BackendFriend {
  id: number;
  owner_id: string;
  friend_id: string;
  username: string;
  isOnline: boolean;
  avatar: string;
  public_id: string;
  accepted: boolean;
}

interface BackendResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get authentication token from cookies
 * IMPORTANT: Must match the cookie name set in auth.ts (line 79)
 */
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt');
  console.log('[getAuthToken] Token found:', token ? `Yes (${token.value.substring(0, 20)}...)` : 'No');
  return token?.value || null;
}

/**
 * Fetch all users from backend
 * Used for user directory, leaderboard
 */
export async function getAllUsers(): Promise<BackendUser[]> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BACKEND_URL}/seeAllUsers`, {
      method: 'GET',
      headers: {
        'Cookie': `jwt=${token}`,
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data as BackendUser[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

/**
 * Get user profile by public_id
 * Used for profile viewing, friend profiles
 */
export async function getUserProfile(publicId: string): Promise<BackendUser | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('[getUserProfile] No auth token available');
      return null;
    }

    console.log('[getUserProfile] Fetching user profile for public_id:', publicId);
    const url = `${BACKEND_URL}/seeProfile?user=${publicId}`;
    console.log('[getUserProfile] Backend URL:', url);
    console.log('[getUserProfile] Token:', token.substring(0, 20) + '...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': `jwt=${token}`,
      },
      cache: 'no-store',
    });

    console.log('[getUserProfile] Response status:', response.status, response.statusText);
    console.log('[getUserProfile] Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[getUserProfile] Backend error response (first 500 chars):', text.substring(0, 500));
      return null;
    }

    // Check what we actually got
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    console.log('[getUserProfile] Response content-type:', contentType);
    console.log('[getUserProfile] Response text (first 200 chars):', responseText.substring(0, 200));
    
    // Try to parse as JSON
    if (contentType && contentType.includes('application/json')) {
      const data = JSON.parse(responseText);
      console.log('[getUserProfile] User profile fetched:', data.username || 'unknown');
      return data as BackendUser;
    } else {
      console.error('[getUserProfile] Expected JSON but got:', contentType);
      console.error('[getUserProfile] Response was HTML, not JSON');
      return null;
    }
  } catch (error) {
    console.error('[getUserProfile] Error fetching user profile:', error);
    return null;
  }
}

/**
 * Get friends list with pending requests
 * Used for friends page
 */
export async function getFriends(): Promise<{
  friends: BackendFriend[];
  pendingRequests: BackendFriend[];
}> {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BACKEND_URL}/handlerFriendsPage`, {
      method: 'GET',
      headers: {
        'Cookie': `jwt=${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();

    return {
      friends: data.friends || [],
      pendingRequests: data.pendingRequests || [],
    };
  } catch (error) {
    console.error('Error fetching friends:', error);
    return {
      friends: [],
      pendingRequests: [],
    };
  }
}

/**
 * Get game stats for a user
 * Always fetch from backend for fresh data
 */
export async function getUserStats(publicId: string): Promise<{
  wins: number;
  losses: number;
  rank: number;
  experience_points: number;
  title: string;
} | null> {
  try {
    const user = await getUserProfile(publicId);
    if (!user) return null;

    return {
      wins: user.wins,
      losses: user.losses,
      rank: user.rank,
      experience_points: user.experience_points,
      title: user.title,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}

/**
 * Check if user is online (from backend)
 * Used when we need real-time status
 */
export async function getUserOnlineStatus(publicId: string): Promise<boolean> {
  try {
    const user = await getUserProfile(publicId);
    // SQLite returns 0/1 as integers, convert to boolean
    return user ? Boolean(user.isOnline) : false;
  } catch (error) {
    console.error('Error fetching online status:', error);
    return false;
  }
}
