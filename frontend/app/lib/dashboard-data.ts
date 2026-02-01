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
  title?: string;
}

export interface DashboardStats {
  rankingPoints: number;
  tier: string;
  level: number;
  wins: number;
  winStreak: number;
  experience_points: number;
  experience_to_next_level: number;
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
  tier: string;
  rank: number;
  rankPoints: number;
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
  publicId: UserId;
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

async function fetchGateway(path: string, jwtValue: string) {
  const response = await fetch(`${API_GATEWAY_URL}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Cookie: `jwt=${jwtValue}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json();
}

export async function getDashboardData(user: User): Promise<DashboardData> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get('jwt');
  const jwtValue = jwt?.value ?? '';

  // Fetch all data in parallel
  const [profileData, historyData, allUsers, friendsData, messagesData] =
    await Promise.all([
      fetchGateway(
        `/api/profile?public_id=${encodeURIComponent(user.public_id)}`,
        jwtValue
      ).catch(() => null),
      fetchGateway('/api/history?limit=10', jwtValue).catch(() => null),
      fetchGateway('/api/users', jwtValue).catch(() => null),
      fetchGateway('/api/friends', jwtValue).catch(() => null),
      fetchGateway('/api/messages?limit=20', jwtValue).catch(() => null),
    ]);

  // --- Profile ---
  const profile: DashboardProfile = {
    userId: user.user_id,
    publicId: user.public_id,
    username: user.username,
    nickname: user.nickname ?? user.username ?? null,
    avatar: profileData?.avatar ?? null,
    isOnline: Boolean(profileData?.isOnline ?? true),
    title: profileData?.title ?? undefined,
  };

  // --- Stats ---
  const wins = profileData?.wins ?? 0;
  const xp = profileData?.experience_points ?? 0;
  const level = profileData?.level ?? Math.floor(xp / 500) + 1;
  const rankingPoints = profileData?.rank_points ?? 0;
  const tier = profileData?.tier ?? 'UNRANKED';
  const experience_points = profileData?.experience_points ?? 0;
  const experience_to_next_level =
    profileData?.experience_to_next_level ?? 500;

  // Compute win streak from recent history
  let winStreak = 0;
  const historyList: any[] = historyData?.history ?? (Array.isArray(historyData) ? historyData : []);
  for (const match of historyList) {
    if (match.isVictory) {
      winStreak++;
    } else {
      break;
    }
  }

  const stats: DashboardStats = { rankingPoints, tier, level, wins, winStreak, experience_points, experience_to_next_level };

  // --- Recent Matches ---
  const matches: DashboardMatch[] = historyList.slice(0, 10).map(
    (match: any, index: number) => {
      const opponent = match.players?.find(
        (p: any) => p.user_id !== user.user_id
      );
      const self = match.players?.find(
        (p: any) => p.user_id === user.user_id
      );
      const selfScore = self?.score ?? 0;
      const oppScore = opponent?.score ?? 0;

      let result: 'win' | 'loss' | 'draw' = 'draw';
      if (match.isVictory) result = 'win';
      else if (match.isVictory === false) result = 'loss';

      return {
        id: index + 1,
        opponentName: opponent?.name ?? 'Unknown',
        opponentAvatar: opponent?.avatar ?? '/images/default-avatar.png',
        result,
        score: `${selfScore} - ${oppScore}`,
        playedAt: match.created_at ?? new Date().toISOString(),
      };
    }
  );

  // --- Activity (synthesized from matches) ---
  const activity: DashboardActivity[] = historyList.slice(0, 5).map(
    (match: any, index: number) => {
      const opponent = match.players?.find(
        (p: any) => p.user_id !== user.user_id
      );
      return {
        id: `activity-match-${index}`,
        type: 'match' as const,
        text: `Played against ${opponent?.name ?? 'Unknown'}`,
        date: match.created_at ?? new Date().toISOString(),
      };
    }
  );

  // --- Leaderboard ---
  const usersArray: any[] = Array.isArray(allUsers) ? allUsers : [];
  const sorted = [...usersArray].sort(
    (a, b) => (b.rank ?? 0) - (a.rank ?? 0)
  );

  // console.log('allUsers: ' + JSON.stringify(allUsers));
  const leaderboard: DashboardLeaderboardEntry[] = sorted
    .slice(0, 10)
    .map((u: any, index: number) => ({
      id: index + 1,
      rank: u.rank ?? 0,
      username: u.nickname ?? u.username ?? 'Unknown',
      avatar: u.avatar ?? '/images/default-avatar.png',
      tier: u.tier ?? 'UNDEFINED',
      rankPoints: u.rank_points ?? 0,
      isOnline: Boolean(u.isOnline),
    }));

  const userRank =
    sorted.findIndex(
      (u: any) => u.user_id === user.user_id || u.public_id === user.public_id
    ) + 1 || 0;

  // --- Friends ---
  const friendsList: any[] = friendsData?.friends ?? [];
  const friends: DashboardFriend[] = friendsList.map(
    (f: any, index: number) => ({
      id: f.id ?? index + 1,
      username: f.username ?? 'Unknown',
      avatar: f.avatar ?? '/images/default-avatar.png',
      isOnline: Boolean(f.isOnline),
    })
  );

  // --- Messages ---
  const inboxList: any[] = Array.isArray(messagesData?.messages)
    ? messagesData.messages
    : [];
  const messages: DashboardMessage[] = inboxList.map((row: any, index: number) => {
    const rawAvatar = row?.avatar;
    const avatar =
      typeof rawAvatar === 'string' && rawAvatar.length > 0 && rawAvatar !== '/public/images/default.jpg'
        ? rawAvatar
        : '/images/default_avatar.png';

    return {
      id: row?.id ?? index + 1,
      publicId: row?.public_id ?? '',
      username: row?.username ?? 'Unknown',
      avatar,
      preview: row?.isLink ? 'Pong Invitation' : (row?.preview ?? ''),
      createdAt: row?.createdAt ?? row?.created_at ?? new Date().toISOString(),
      isOnline: Boolean(row?.isOnline),
    };
  }).filter((msg) => Boolean(msg.publicId));

  const unreadCount = Number(messagesData?.unreadCount) || 0;

  return {
    profile,
    stats,
    matches,
    activity,
    leaderboard,
    friends,
    messages,
    unreadCount,
    userRank,
  };
}
