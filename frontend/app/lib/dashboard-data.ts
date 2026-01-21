import { cookies } from 'next/headers';
import { User } from '@/app/lib/auth';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

type UserId = string;
type EntityId = number;

export interface DashboardProfile {
  userId: UserId;
  publicId: UserId;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  isOnline: boolean;
}

export interface DashboardStats {
  ranking: number;
  level: number;
  wins: number;
  winStreak: number;
}

export interface DashboardMatch {
  id: EntityId;
  opponentName: string;
  opponentAvatar: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  playedAt: string;
}

export interface DashboardActivity {
  id: string;
  type: 'match' | 'achievement' | 'friendship';
  text: string;
  date: string;
}

export interface DashboardLeaderboardEntry {
  id: EntityId;
  username: string;
  avatar: string;
  ranking: number;
  isOnline: boolean;
}

export interface DashboardFriend {
  id: EntityId;
  username: string;
  avatar: string;
  isOnline: boolean;
}

export interface DashboardMessage {
  id: EntityId;
  username: string;
  avatar: string;
  preview: string;
  createdAt: string;
  isOnline: boolean;
}

export interface DashboardData {
  profile: DashboardProfile;
  stats: DashboardStats;
  matches: DashboardMatch[];
  activity: DashboardActivity[];
  leaderboard: DashboardLeaderboardEntry[];
  friends: DashboardFriend[];
  messages: DashboardMessage[];
  unreadCount: number;
  userRank: number;
}

// TODO: Replace mock data with real API sources.
export async function getDashboardData(user: User): Promise<DashboardData> {
  const now = new Date();
  let avatar: string | null = null;
  let isOnline = true;

  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt');

    if (jwt && user.public_id) {
      const response = await fetch(
        `${API_GATEWAY_URL}/api/profile?public_id=${encodeURIComponent(
          user.public_id
        )}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Cookie: `jwt=${jwt.value}`,
          },
          cache: 'no-store',
        }
      );

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          avatar = data?.avatar ?? null;
          isOnline = Boolean(data?.isOnline ?? true);
        }
      }
    }
  } catch {
    avatar = null;
  }

  return {
    profile: {
      userId: user.user_id,
      publicId: user.public_id,
      username: user.username,
      nickname: user.nickname ?? user.username ?? null,
      avatar,
      isOnline,
    },
    stats: {
      ranking: 1240,
      level: 7,
      wins: 12,
      winStreak: 3,
    },
    matches: [
      {
        id: 1,
        opponentName: 'Nebula',
        opponentAvatar: '/images/avatar4.png',
        result: 'win',
        score: '11 - 7',
        playedAt: now.toISOString(),
      },
      {
        id: 2,
        opponentName: 'Photon',
        opponentAvatar: '/images/avatar5.png',
        result: 'loss',
        score: '11 - 9',
        playedAt: new Date(now.getTime() - 86400000).toISOString(),
      },
    ],
    activity: [
      {
        id: 'activity-match-1',
        type: 'match',
        text: 'Played against Nebula',
        date: now.toISOString(),
      },
      {
        id: 'activity-achievement-1',
        type: 'achievement',
        text: 'Unlocked First Win',
        date: new Date(now.getTime() - 3600000).toISOString(),
      },
      {
        id: 'activity-friend-1',
        type: 'friendship',
        text: 'New friend: Ion',
        date: new Date(now.getTime() - 7200000).toISOString(),
      },
    ],
    leaderboard: [
      {
        id: 101,
        username: 'Nova',
        avatar: '/images/avatar1.png',
        ranking: 1890,
        isOnline: true,
      },
      {
        id: 102,
        username: 'Quark',
        avatar: '/images/avatar2.png',
        ranking: 1760,
        isOnline: false,
      },
      {
        id: 103,
        username: 'Pulse',
        avatar: '/images/avatar3.png',
        ranking: 1655,
        isOnline: true,
      },
    ],
    friends: [
      {
        id: 301,
        username: 'Ion',
        avatar: '/images/avatar2.png',
        isOnline: true,
      },
      {
        id: 302,
        username: 'Drift',
        avatar: '/images/avatar3.png',
        isOnline: true,
      },
    ],
    messages: [
      {
        id: 401,
        username: 'Orbit',
        avatar: '/images/avatar4.png',
        preview: 'Queueing for a match?',
        createdAt: now.toISOString(),
        isOnline: true,
      },
    ],
    unreadCount: 1,
    userRank: 42,
  };
}
