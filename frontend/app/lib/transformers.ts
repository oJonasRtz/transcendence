/**
 * Data Transformation Utilities
 *
 * Transforms data between SQLite backend and Prisma frontend formats.
 * Used in the hybrid sync approach.
 */

import { User as PrismaUser } from '../../prisma/generated';

/**
 * SQLite User type (from backend)
 */
export interface SQLiteUser {
  user_id: string; // UUID
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  inQueue: boolean;
  inGame: boolean;
  rank: number;
  public_id: string; // UUID
  title: string;
  description: string | null;
  friends: number;
  wins: number;
  losses: number;
  experience_points: number;
  created_at: string;
  updated_at: string;
}

/**
 * SQLite Friend type (from backend)
 */
export interface SQLiteFriend {
  id: number;
  owner_id: string;
  friend_id: string;
  username: string;
  isOnline: boolean;
  avatar: string;
  public_id: string;
  accepted: boolean;
}

/**
 * Transform SQLite user to Prisma-compatible format
 *
 * NOTE: This does NOT include the Prisma `id` field (autoincrement Int).
 * Prisma will generate that on insert. We use username as the unique identifier
 * for syncing since it's unique in both systems.
 */
export function transformSQLiteUserToPrisma(sqliteUser: SQLiteUser): Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    username: sqliteUser.username,
    email: sqliteUser.email,
    passwordHash: '', // Not synced from backend for security
    avatar: sqliteUser.avatar || '/images/default_avatar.png',
    isOnline: sqliteUser.isOnline,
    lastSeen: sqliteUser.isOnline ? new Date() : null,
  };
}

/**
 * Create a mapping between SQLite user_id (UUID) and Prisma id (Int)
 *
 * This is crucial for the hybrid approach. We need to maintain this mapping
 * to convert between systems.
 */
export interface UserIdMapping {
  prismaId: number;
  sqliteUserId: string; // UUID
  username: string; // For debugging
}

/**
 * Transform SQLite friend to Prisma Friendship format
 *
 * NOTE: SQLite requires 2 rows for mutual friendship:
 *   - Row 1: owner_id=A, friend_id=B, accepted=true
 *   - Row 2: owner_id=B, friend_id=A, accepted=true
 *
 * Prisma uses single row with status enum:
 *   - Row: userId=A, friendId=B, status=accepted
 *
 * This transformer handles the conversion logic.
 */
export function transformSQLiteFriendshipToPrisma(
  sqliteFriend: SQLiteFriend,
  userIdMap: Map<string, number>
): {
  userId: number;
  friendId: number;
  status: 'accepted' | 'pending' | 'blocked';
} | null {
  const userId = userIdMap.get(sqliteFriend.owner_id);
  const friendId = userIdMap.get(sqliteFriend.friend_id);

  if (!userId || !friendId) {
    console.warn('Could not map friendship IDs:', {
      owner_id: sqliteFriend.owner_id,
      friend_id: sqliteFriend.friend_id,
    });
    return null;
  }

  return {
    userId,
    friendId,
    status: sqliteFriend.accepted ? 'accepted' : 'pending',
  };
}

/**
 * Deduplicate mutual friendships from SQLite
 *
 * SQLite returns both:
 *   - {owner_id: A, friend_id: B, accepted: true}
 *   - {owner_id: B, friend_id: A, accepted: true}
 *
 * We only need one row in Prisma. This function filters duplicates
 * by keeping the one where userId < friendId (lexicographic order).
 */
export function deduplicateMutualFriendships(
  friendships: Array<{
    userId: number;
    friendId: number;
    status: 'accepted' | 'pending' | 'blocked';
  }>
): Array<{
  userId: number;
  friendId: number;
  status: 'accepted' | 'pending' | 'blocked';
}> {
  const seen = new Set<string>();
  const deduplicated = [];

  for (const friendship of friendships) {
    // Create a unique key with sorted IDs
    const key = [friendship.userId, friendship.friendId].sort().join('-');

    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(friendship);
    }
  }

  return deduplicated;
}

/**
 * Calculate game statistics summary
 */
export function calculateGameStats(user: SQLiteUser) {
  const totalGames = user.wins + user.losses;
  const winRate = totalGames > 0 ? (user.wins / totalGames) * 100 : 0;

  return {
    wins: user.wins,
    losses: user.losses,
    totalGames,
    winRate: Math.round(winRate * 10) / 10, // Round to 1 decimal
    rank: user.rank,
    level: Math.floor(user.experience_points / 100), // Example: 100 XP = 1 level
    xp: user.experience_points,
    title: user.title,
  };
}

/**
 * Format user display name
 * Uses nickname if available, falls back to username
 */
export function formatUserDisplayName(user: SQLiteUser | { username: string; nickname?: string }): string {
  if ('nickname' in user && user.nickname) {
    return user.nickname;
  }
  return user.username;
}

/**
 * Get user status badge info
 */
export function getUserStatusBadge(user: SQLiteUser): {
  status: 'online' | 'in-game' | 'in-queue' | 'offline';
  label: string;
  color: string;
} {
  if (user.inGame) {
    return {
      status: 'in-game',
      label: 'In Game',
      color: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    };
  }

  if (user.inQueue) {
    return {
      status: 'in-queue',
      label: 'In Queue',
      color: 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    };
  }

  if (user.isOnline) {
    return {
      status: 'online',
      label: 'Online',
      color: 'text-green-400 border-green-500/50 bg-green-500/10',
    };
  }

  return {
    status: 'offline',
    label: 'Offline',
    color: 'text-gray-400 border-gray-500/50 bg-gray-500/10',
  };
}
