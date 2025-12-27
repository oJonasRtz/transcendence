import { PrismaClient } from '../../prisma/generated';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL connection pool with proper configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter with the pool instance
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with the adapter
const prisma = new PrismaClient({
  adapter: adapter as any, // Type assertion needed for custom adapters
});

// ============================================
// USER QUERIES
// ============================================

/**
 * Create user in Prisma database (for syncing with backend)
 * Uses upsert to avoid duplicate key errors if user already exists
 */
export async function createUserInPrisma(data: {
  username: string;
  email: string;
  passwordHash: string;
}) {
  return await prisma.user.upsert({
    where: { email: data.email },
    update: {
      username: data.username,
    },
    create: {
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash || 'managed_by_backend',
    },
  });
}

/**
 * Get user by ID with all relations
 */
export async function getUserById(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gameStats: true,
      sentFriendships: {
        include: {
          friend: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      receivedFriendships: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      achievements: {
        include: {
          achievement: true,
        },
      },
    },
  });
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      avatar: true,
      isOnline: true,
      lastSeen: true,
      createdAt: true,
    },
  });
}

/**
 * Get user by email (for authentication)
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: number,
  data: {
    username?: string;
    email?: string;
    avatar?: string;
  }
) {
  return await prisma.user.update({
    where: { id: userId },
    data,
  });
}

/**
 * Update user online status
 */
export async function updateUserOnlineStatus(
  userId: number,
  isOnline: boolean
) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline,
      lastSeen: isOnline ? undefined : new Date(),
    },
  });
}

/**
 * Get all online users
 */
export async function getOnlineUsers() {
  return await prisma.user.findMany({
    where: { isOnline: true },
    select: {
      id: true,
      username: true,
      avatar: true,
      isOnline: true,
    },
  });
}

/**
 * Search users by username
 */
export async function searchUsers(query: string, limit: number = 10) {
  return await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: limit,
    select: {
      id: true,
      username: true,
      avatar: true,
      isOnline: true,
    },
  });
}

// ============================================
// FRIENDSHIP QUERIES
// ============================================

/**
 * Get all friends (accepted friendships only)
 */
export async function getFriends(userId: number) {
  const [sent, received] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        userId,
        status: 'accepted',
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    }),
    prisma.friendship.findMany({
      where: {
        friendId: userId,
        status: 'accepted',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    }),
  ]);

  return [...sent.map((f) => f.friend), ...received.map((f) => f.user)];
}

/**
 * Get pending friend requests (received)
 */
export async function getPendingFriendRequests(userId: number) {
  return await prisma.friendship.findMany({
    where: {
      friendId: userId,
      status: 'pending',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          isOnline: true,
        },
      },
    },
  });
}

/**
 * Get sent friend requests
 */
export async function getSentFriendRequests(userId: number) {
  return await prisma.friendship.findMany({
    where: {
      userId,
      status: 'pending',
    },
    include: {
      friend: {
        select: {
          id: true,
          username: true,
          avatar: true,
          isOnline: true,
        },
      },
    },
  });
}

/**
 * Send friend request
 */
export async function sendFriendRequest(userId: number, friendId: number) {
  // Check if friendship already exists
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });

  if (existing) {
    throw new Error('Friendship already exists');
  }

  return await prisma.friendship.create({
    data: {
      userId,
      friendId,
      status: 'pending',
    },
  });
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(friendshipId: number) {
  return await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: 'accepted' },
  });
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(friendshipId: number) {
  return await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: 'rejected' },
  });
}

/**
 * Remove friend / Cancel friend request
 */
export async function removeFriend(friendshipId: number) {
  return await prisma.friendship.delete({
    where: { id: friendshipId },
  });
}

/**
 * Block user
 */
export async function blockUser(userId: number, friendId: number) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });

  if (friendship) {
    return await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'blocked' },
    });
  }

  return await prisma.friendship.create({
    data: {
      userId,
      friendId,
      status: 'blocked',
    },
  });
}

/**
 * Check friendship status between two users
 */
export async function getFriendshipStatus(userId: number, friendId: number) {
  return await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });
}

// ============================================
// MESSAGE QUERIES
// ============================================

/**
 * Get or create conversation between two users
 */
export async function getOrCreateConversation(
  user1Id: number,
  user2Id: number
) {
  // Find existing conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [user1Id, user2Id] },
        },
      },
    },
    include: {
      participants: true,
    },
  });

  // Create if doesn't exist
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: user1Id }, { userId: user2Id }],
        },
      },
      include: {
        participants: true,
      },
    });
  }

  return conversation;
}

/**
 * Send a message
 */
export async function sendMessage(
  senderId: number,
  receiverId: number,
  content: string
) {
  const conversation = await getOrCreateConversation(senderId, receiverId);

  return await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      receiverId,
      content,
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get messages in a conversation
 */
export async function getMessages(
  conversationId: number,
  limit: number = 50,
  offset: number = 0
) {
  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
    skip: offset,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get conversation between two users with messages
 */
export async function getConversationBetweenUsers(
  user1Id: number,
  user2Id: number,
  limit: number = 50
) {
  const conversation = await getOrCreateConversation(user1Id, user2Id);
  const messages = await getMessages(conversation.id, limit);

  return {
    conversation,
    messages,
  };
}

/**
 * Get all user conversations with last message
 */
export async function getUserConversations(userId: number) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return conversations.map((conv) => ({
    ...conv,
    otherUser: conv.participants.find((p) => p.userId !== userId)?.user,
    lastMessage: conv.messages[0],
  }));
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: number,
  userId: number
) {
  return await prisma.message.updateMany({
    where: {
      conversationId,
      receiverId: userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Get unread message count
 */
export async function getUnreadMessageCount(userId: number) {
  return await prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });
}

/**
 * Get unread messages by conversation
 */
export async function getUnreadMessagesByConversation(userId: number) {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },
    include: {
      messages: {
        where: {
          receiverId: userId,
          isRead: false,
        },
      },
      participants: {
        where: {
          userId: {
            not: userId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return conversations
    .filter((conv) => conv.messages.length > 0)
    .map((conv) => ({
      conversationId: conv.id,
      otherUser: conv.participants[0]?.user,
      unreadCount: conv.messages.length,
    }));
}

// ============================================
// GAME STATS QUERIES
// ============================================

/**
 * Get user game stats
 */
export async function getGameStats(userId: number) {
  return await prisma.gameStats.findUnique({
    where: { userId },
  });
}

/**
 * Create or update game stats
 */
export async function upsertGameStats(
  userId: number,
  data: {
    wins?: number;
    losses?: number;
    draws?: number;
    ranking?: number;
    level?: number;
    xp?: number;
    winStreak?: number;
  }
) {
  return await prisma.gameStats.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

/**
 * Update stats after match
 */
export async function updateStatsAfterMatch(
  userId: number,
  won: boolean,
  draw: boolean = false
) {
  const stats = await prisma.gameStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    return await prisma.gameStats.create({
      data: {
        userId,
        wins: won ? 1 : 0,
        losses: !won && !draw ? 1 : 0,
        draws: draw ? 1 : 0,
        ranking: won ? 1025 : draw ? 1000 : 975,
        winStreak: won ? 1 : 0,
      },
    });
  }

  const rankingChange = won ? 25 : draw ? 0 : -25;
  const xpGain = won ? 100 : draw ? 50 : 25;

  return await prisma.gameStats.update({
    where: { userId },
    data: {
      wins: won ? { increment: 1 } : undefined,
      losses: !won && !draw ? { increment: 1 } : undefined,
      draws: draw ? { increment: 1 } : undefined,
      ranking: { increment: rankingChange },
      xp: { increment: xpGain },
      winStreak: won ? { increment: 1 } : 0,
    },
  });
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 10, offset: number = 0) {
  return await prisma.gameStats.findMany({
    orderBy: { ranking: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          isOnline: true,
        },
      },
    },
  });
}

/**
 * Get user rank position
 */
export async function getUserRankPosition(userId: number) {
  const userStats = await prisma.gameStats.findUnique({
    where: { userId },
  });

  if (!userStats) return null;

  const higherRanked = await prisma.gameStats.count({
    where: {
      ranking: {
        gt: userStats.ranking,
      },
    },
  });

  return higherRanked + 1;
}

// ============================================
// MATCH QUERIES
// ============================================

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredMatches(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          {
            player1: {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            player2: {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            winner: {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            score: {
              contains: query,
            },
          },
        ],
      },
      include: {
        player1: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        winner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        playedAt: 'desc',
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    return matches;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch matches.');
  }
}

export async function fetchMatchesPages(query: string) {
  try {
    const totalCount = await prisma.match.count({
      where: {
        OR: [
          {
            player1: {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            player2: {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            winner: {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          },
          {
            score: {
              contains: query,
            },
          },
        ],
      },
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of matches.');
  }
}


/**
 * Create a match
 */
export async function createMatch(data: {
  player1Id: number;
  player2Id: number;
  winnerId: number | null;
  result: 'player1Win' | 'player2Win' | 'draw';
  score?: string;
  duration?: number;
}) {
  const match = await prisma.match.create({
    data,
    include: {
      player1: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      player2: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  // Update stats for both players
  const isDraw = data.result === 'draw';
  await Promise.all([
    updateStatsAfterMatch(
      data.player1Id,
      data.result === 'player1Win',
      isDraw
    ),
    updateStatsAfterMatch(
      data.player2Id,
      data.result === 'player2Win',
      isDraw
    ),
  ]);

  return match;
}

/**
 * Get user match history
 */
export async function getMatchHistory(
  userId: number,
  limit: number = 20,
  offset: number = 0
) {
  return await prisma.match.findMany({
    where: {
      OR: [{ player1Id: userId }, { player2Id: userId }],
    },
    orderBy: { playedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      player1: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      player2: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get match by ID
 */
export async function getMatchById(matchId: number) {
  return await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      player1: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      player2: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get recent matches (all users)
 */
export async function getRecentMatches(limit: number = 10) {
  return await prisma.match.findMany({
    orderBy: { playedAt: 'desc' },
    take: limit,
    include: {
      player1: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      player2: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
}

/**
 * Get head-to-head record between two players
 */
export async function getHeadToHead(player1Id: number, player2Id: number) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { player1Id, player2Id },
        { player1Id: player2Id, player2Id: player1Id },
      ],
    },
    orderBy: { playedAt: 'desc' },
  });

  const player1Wins = matches.filter(
    (m) =>
      (m.player1Id === player1Id && m.result === 'player1Win') ||
      (m.player2Id === player1Id && m.result === 'player2Win')
  ).length;

  const player2Wins = matches.filter(
    (m) =>
      (m.player1Id === player2Id && m.result === 'player1Win') ||
      (m.player2Id === player2Id && m.result === 'player2Win')
  ).length;

  const draws = matches.filter((m) => m.result === 'draw').length;

  return {
    totalMatches: matches.length,
    player1Wins,
    player2Wins,
    draws,
    matches,
  };
}

// ============================================
// ACHIEVEMENT QUERIES
// ============================================

/**
 * Get all achievements
 */
export async function getAllAchievements() {
  return await prisma.achievement.findMany({
    orderBy: { requirement: 'asc' },
  });
}

/**
 * Get user achievements
 */
export async function getUserAchievements(userId: number) {
  return await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: { unlockedAt: 'desc' },
  });
}

/**
 * Unlock achievement for user
 */
export async function unlockAchievement(userId: number, achievementId: number) {
  // Check if already unlocked
  const existing = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
  });

  if (!achievement) {
    throw new Error('Achievement not found');
  }

  // Award XP
  await prisma.gameStats.update({
    where: { userId },
    data: {
      xp: { increment: achievement.xpReward },
    },
  });

  return await prisma.userAchievement.create({
    data: {
      userId,
      achievementId,
      progress: achievement.requirement,
    },
    include: {
      achievement: true,
    },
  });
}

/**
 * Update achievement progress
 */
export async function updateAchievementProgress(
  userId: number,
  achievementId: number,
  progress: number
) {
  const achievement = await prisma.achievement.findUnique({
    where: { id: achievementId },
  });

  if (!achievement) {
    throw new Error('Achievement not found');
  }

  const userAchievement = await prisma.userAchievement.upsert({
    where: {
      userId_achievementId: {
        userId,
        achievementId,
      },
    },
    update: {
      progress,
    },
    create: {
      userId,
      achievementId,
      progress,
    },
  });

  // Auto-unlock if requirement met
  if (progress >= achievement.requirement && !userAchievement.unlockedAt) {
    return await unlockAchievement(userId, achievementId);
  }

  return userAchievement;
}

/**
 * Check and unlock achievements based on stats
 */
export async function checkAndUnlockAchievements(userId: number) {
  const stats = await prisma.gameStats.findUnique({
    where: { userId },
  });

  if (!stats) return [];

  const achievements = await prisma.achievement.findMany();
  const unlocked = [];

  for (const achievement of achievements) {
    let shouldUnlock = false;

    switch (achievement.category) {
      case 'wins':
        shouldUnlock = stats.wins >= achievement.requirement;
        break;
      case 'matches':
        const totalMatches = stats.wins + stats.losses + stats.draws;
        shouldUnlock = totalMatches >= achievement.requirement;
        break;
      case 'streak':
        shouldUnlock = stats.winStreak >= achievement.requirement;
        break;
      case 'ranking':
        shouldUnlock = stats.ranking >= achievement.requirement;
        break;
    }

    if (shouldUnlock) {
      try {
        const result = await unlockAchievement(userId, achievement.id);
        unlocked.push(result);
      } catch (error) {
        // Already unlocked, skip
      }
    }
  }

  return unlocked;
}

// ============================================
// STATISTICS QUERIES
// ============================================

/**
 * Get user statistics summary
 */
export async function getUserStatistics(userId: number) {
  const [gameStats, matchCount, friends, achievements, unreadMessages] =
    await Promise.all([
      prisma.gameStats.findUnique({ where: { userId } }),
      prisma.match.count({
        where: {
          OR: [{ player1Id: userId }, { player2Id: userId }],
        },
      }),
      getFriends(userId),
      getUserAchievements(userId),
      getUnreadMessageCount(userId),
    ]);

  return {
    gameStats,
    matchCount,
    friendCount: friends.length,
    achievementCount: achievements.length,
    unreadMessages,
  };
}

/**
 * Get platform statistics
 */
export async function getPlatformStatistics() {
  const [
    totalUsers,
    onlineUsers,
    totalMatches,
    totalMessages,
    totalFriendships,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isOnline: true } }),
    prisma.match.count(),
    prisma.message.count(),
    prisma.friendship.count({ where: { status: 'accepted' } }),
  ]);

  return {
    totalUsers,
    onlineUsers,
    totalMatches,
    totalMessages,
    totalFriendships,
  };
}

/**
 * Get quick stats for dashboard cards
 */
export async function getDashboardStats(userId: number) {
  const [stats, friends, unreadMessages, achievements] = await Promise.all([
    getGameStats(userId),
    getFriends(userId),
    getUnreadMessageCount(userId),
    prisma.userAchievement.count({ where: { userId } }),
  ]);

  return {
    ranking: stats?.ranking || 1000,
    level: stats?.level || 1,
    wins: stats?.wins || 0,
    friendCount: friends.length,
    unreadMessages,
    achievementCount: achievements,
    winStreak: stats?.winStreak || 0,
  };
}

/**
 * Get activity feed for dashboard
 */
export async function getActivityFeed(userId: number, limit: number = 10) {
  // Get recent matches
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ player1Id: userId }, { player2Id: userId }],
    },
    orderBy: { playedAt: 'desc' },
    take: limit,
    include: {
      player1: { select: { id: true, username: true, avatar: true } },
      player2: { select: { id: true, username: true, avatar: true } },
    },
  });

  // Get recent achievements
  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
    take: limit,
    include: {
      achievement: true,
    },
  });

  // Get recent friendships
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userId }, { friendId: userId }],
      status: 'accepted',
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      user: { select: { id: true, username: true, avatar: true } },
      friend: { select: { id: true, username: true, avatar: true } },
    },
  });

  // Combine and sort by date
  const activities = [
    ...matches.map((match) => ({
      type: 'match' as const,
      date: match.playedAt,
      data: match,
    })),
    ...achievements.map((achievement) => ({
      type: 'achievement' as const,
      date: achievement.unlockedAt || new Date(),
      data: achievement,
    })),
    ...friendships.map((friendship) => ({
      type: 'friendship' as const,
      date: friendship.updatedAt,
      data: friendship,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  return activities;
}

/**
 * Get match statistics breakdown
 */
export async function getMatchStatistics(userId: number) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ player1Id: userId }, { player2Id: userId }],
    },
    orderBy: { playedAt: 'desc' },
  });

  const stats = {
    total: matches.length,
    wins: 0,
    losses: 0,
    draws: 0,
    totalDuration: 0,
    averageDuration: 0,
    winsByPlayer1: 0,
    winsByPlayer2: 0,
    recentForm: [] as ('W' | 'L' | 'D')[],
  };

  matches.forEach((match) => {
    const isPlayer1 = match.player1Id === userId;
    const won =
      (isPlayer1 && match.result === 'player1Win') ||
      (!isPlayer1 && match.result === 'player2Win');
    const draw = match.result === 'draw';

    if (won) {
      stats.wins++;
      if (isPlayer1) stats.winsByPlayer1++;
      else stats.winsByPlayer2++;
    } else if (draw) {
      stats.draws++;
    } else {
      stats.losses++;
    }

    if (match.duration) {
      stats.totalDuration += match.duration;
    }

    // Recent form (last 10 matches)
    if (stats.recentForm.length < 10) {
      stats.recentForm.push(won ? 'W' : draw ? 'D' : 'L');
    }
  });

  stats.averageDuration =
    stats.total > 0 ? Math.round(stats.totalDuration / stats.total) : 0;

  return stats;
}

/**
 * Get user profile with all details
 */
export async function getUserProfile(userId: number) {
  const [user, gameStats, rankPosition, matchStats, achievements, friends] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
          isOnline: true,
          lastSeen: true,
          createdAt: true,
        },
      }),
      getGameStats(userId),
      getUserRankPosition(userId),
      getMatchStatistics(userId),
      getUserAchievements(userId),
      getFriends(userId),
    ]);

  return {
    user,
    gameStats,
    rankPosition,
    matchStats,
    achievements,
    friendCount: friends.length,
  };
}

/**
 * Search for matches with filters
 */
export async function searchMatches(filters: {
  userId?: number;
  result?: 'player1Win' | 'player2Win' | 'draw';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const { userId, result, startDate, endDate, limit = 20, offset = 0 } = filters;

  const where: any = {};

  if (userId) {
    where.OR = [{ player1Id: userId }, { player2Id: userId }];
  }

  if (result) {
    where.result = result;
  }

  if (startDate || endDate) {
    where.playedAt = {};
    if (startDate) where.playedAt.gte = startDate;
    if (endDate) where.playedAt.lte = endDate;
  }

  return await prisma.match.findMany({
    where,
    orderBy: { playedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      player1: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      player2: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
    },
  });
}