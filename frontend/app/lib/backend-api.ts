'use server';

import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

/**
 * Hybrid Approach Backend API
 *
 * These server actions fetch data from the SQLite backend microservices.
 * Used when we need fresh data that isn't synced to Prisma.
 */

interface BackendUser {
  user_id: string;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  inQueue: boolean;
  inGame: boolean;
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
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BACKEND_URL}/seeProfile?user=${publicId}`, {
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
    return data as BackendUser;
  } catch (error) {
    console.error('Error fetching user profile:', error);
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
    return user?.isOnline || false;
  } catch (error) {
    console.error('Error fetching online status:', error);
    return false;
  }
}
