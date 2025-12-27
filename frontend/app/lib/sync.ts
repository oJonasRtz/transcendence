'use server';

import { prisma } from '@/app/lib/prisma';
import { getAllUsers, getFriends } from './backend-api';
import {
  transformSQLiteUserToPrisma,
  transformSQLiteFriendshipToPrisma,
  deduplicateMutualFriendships,
  type SQLiteUser,
} from './transformers';

/**
 * Hybrid Sync Strategy
 *
 * This file implements the sync logic between SQLite backend and Prisma frontend.
 *
 * SYNC RULES:
 * ✅ SYNC to Prisma:
 *    - Basic user data (username, email, avatar, isOnline)
 *    - Friendships (for fast relationship queries)
 *
 * ❌ DO NOT SYNC (query from backend):
 *    - Game stats (wins, losses, rank, XP) - always fetch fresh
 *    - Messages (chat) - kept in SQLite, real-time via Socket.io
 *    - Match history - backend only
 *    - Achievements - backend only
 *
 * WHEN TO SYNC:
 * - On user login (sync their data)
 * - Periodically in background (every 5 minutes for online users)
 * - On friend add/remove (sync friendships)
 * - On profile update (sync basic fields only)
 */

/**
 * Sync a single user from SQLite to Prisma
 *
 * Uses publicId (SQLite UUID) as the unique identifier for robust ID mapping.
 * Creates user if doesn't exist, updates if exists.
 */
export async function syncUserToPrisma(sqliteUser: SQLiteUser): Promise<void> {
  try {
    const prismaData = transformSQLiteUserToPrisma(sqliteUser);

    await prisma.user.upsert({
      where: { publicId: sqliteUser.public_id },
      update: {
        username: prismaData.username,
        email: prismaData.email,
        avatar: prismaData.avatar,
        isOnline: prismaData.isOnline,
        lastSeen: prismaData.lastSeen,
      },
      create: {
        publicId: sqliteUser.public_id,
        username: prismaData.username,
        email: prismaData.email,
        passwordHash: prismaData.passwordHash, // Empty string - we don't sync passwords
        avatar: prismaData.avatar,
        isOnline: prismaData.isOnline,
        lastSeen: prismaData.lastSeen,
      },
    });

    console.log(`Synced user to Prisma: ${sqliteUser.username} (${sqliteUser.public_id})`);
  } catch (error) {
    console.error('Error syncing user to Prisma:', error);
    throw error;
  }
}

/**
 * Sync all users from SQLite to Prisma
 *
 * Used for initial sync or full refresh.
 * WARNING: This can be expensive for large user bases.
 */
export async function syncAllUsersToPrisma(): Promise<{
  synced: number;
  errors: number;
}> {
  try {
    const sqliteUsers = await getAllUsers();
    let synced = 0;
    let errors = 0;

    for (const user of sqliteUsers) {
      try {
        await syncUserToPrisma(user);
        synced++;
      } catch (error) {
        console.error(`Failed to sync user ${user.username}:`, error);
        errors++;
      }
    }

    console.log(`Sync complete: ${synced} users synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error('Error in syncAllUsersToPrisma:', error);
    throw error;
  }
}

/**
 * Create a mapping between SQLite user_id/public_id and Prisma id
 *
 * This is essential for syncing relationships (friendships).
 * We need to convert UUID → Int when creating friendships.
 * Now uses publicId for more robust mapping.
 */
async function createUserIdMapping(
  sqliteUsers: SQLiteUser[]
): Promise<Map<string, number>> {
  const mapping = new Map<string, number>();

  // Get all Prisma users with publicId
  const prismaUsers = await prisma.user.findMany({
    select: { id: true, publicId: true },
  });

  // Create a publicId → id map (more robust than username)
  const publicIdToIdMap = new Map(
    prismaUsers.map((u) => [u.publicId, u.id])
  );

  // Map SQLite public_id to Prisma id
  for (const sqliteUser of sqliteUsers) {
    const prismaId = publicIdToIdMap.get(sqliteUser.public_id);
    if (prismaId) {
      // Map both user_id and public_id to the same Prisma id for flexibility
      mapping.set(sqliteUser.user_id, prismaId);
      mapping.set(sqliteUser.public_id, prismaId);
    }
  }

  return mapping;
}

/**
 * Sync friendships from SQLite to Prisma
 *
 * Handles the conversion from SQLite's bidirectional model
 * (2 rows per friendship) to Prisma's single row model.
 */
export async function syncFriendshipsToPrisma(): Promise<{
  synced: number;
  errors: number;
}> {
  try {
    // Get all users to create ID mapping
    const sqliteUsers = await getAllUsers();
    const userIdMap = await createUserIdMapping(sqliteUsers);

    // Get all friendships from backend
    const { friends, pendingRequests } = await getFriends();
    const allFriendships = [...friends, ...pendingRequests];

    // Transform to Prisma format
    const transformedFriendships = allFriendships
      .map((f) => transformSQLiteFriendshipToPrisma(f, userIdMap))
      .filter((f) => f !== null) as Array<{
      userId: number;
      friendId: number;
      status: 'accepted' | 'pending' | 'blocked';
    }>;

    // Deduplicate mutual friendships
    const deduplicated = deduplicateMutualFriendships(transformedFriendships);

    let synced = 0;
    let errors = 0;

    // Sync each friendship
    for (const friendship of deduplicated) {
      try {
        await prisma.friendship.upsert({
          where: {
            userId_friendId: {
              userId: friendship.userId,
              friendId: friendship.friendId,
            },
          },
          update: {
            status: friendship.status,
          },
          create: friendship,
        });
        synced++;
      } catch (error) {
        console.error('Failed to sync friendship:', error);
        errors++;
      }
    }

    console.log(`Friendships sync complete: ${synced} synced, ${errors} errors`);
    return { synced, errors };
  } catch (error) {
    console.error('Error in syncFriendshipsToPrisma:', error);
    throw error;
  }
}

/**
 * Get current user's Prisma ID by username
 *
 * Helper function to convert from SQLite user_id to Prisma id.
 */
export async function getPrismaIdByUsername(
  username: string
): Promise<number | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return user?.id || null;
  } catch (error) {
    console.error('Error getting Prisma ID:', error);
    return null;
  }
}

/**
 * Get current user's Prisma ID by publicId (SQLite UUID)
 *
 * Preferred method for ID lookup - more robust than username.
 */
export async function getPrismaIdByPublicId(
  publicId: string
): Promise<number | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { publicId },
      select: { id: true },
    });
    return user?.id || null;
  } catch (error) {
    console.error('Error getting Prisma ID by publicId:', error);
    return null;
  }
}

/**
 * Update user online status in Prisma
 *
 * Called when user logs in/out or when we detect status change.
 * This is a lightweight sync that happens frequently.
 */
export async function updateUserOnlineStatus(
  username: string,
  isOnline: boolean
): Promise<void> {
  try {
    await prisma.user.update({
      where: { username },
      data: {
        isOnline,
        lastSeen: isOnline ? undefined : new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating online status:', error);
  }
}

/**
 * Full sync - users + friendships
 *
 * Use sparingly - this is expensive.
 * Recommended: Run once on deployment, then use incremental syncs.
 */
export async function fullSync(): Promise<{
  users: { synced: number; errors: number };
  friendships: { synced: number; errors: number };
}> {
  console.log('Starting full sync...');

  const users = await syncAllUsersToPrisma();
  const friendships = await syncFriendshipsToPrisma();

  console.log('Full sync complete:', { users, friendships });

  return { users, friendships };
}
