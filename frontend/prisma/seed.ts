import { PrismaClient, Prisma } from './generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - be careful in production!)
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.match.deleteMany();
  await prisma.gameStats.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: hashedPassword,
        avatar: 'public/images/avatar1.png',
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: hashedPassword,
        avatar: 'public/images/avatar2.png',
        isOnline: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'charlie',
        email: 'charlie@example.com',
        passwordHash: hashedPassword,
        avatar: 'public/images/avatar3.png',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      },
    }),
    prisma.user.create({
      data: {
        username: 'diana',
        email: 'diana@example.com',
        passwordHash: hashedPassword,
        avatar: 'public/images/avatar4.png',
        isOnline: false,
        lastSeen: new Date(Date.now() - 86400000), // 1 day ago
      },
    }),
    prisma.user.create({
      data: {
        username: 'eve',
        email: 'eve@example.com',
        passwordHash: hashedPassword,
        avatar: 'public/images/avatar5.png',
        isOnline: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create GameStats for each user
  const gameStatsData = [
    { userId: users[0].id, wins: 25, losses: 10, draws: 2, ranking: 1850, level: 15, xp: 3500, winStreak: 5 },
    { userId: users[1].id, wins: 30, losses: 15, draws: 3, ranking: 1920, level: 18, xp: 4200, winStreak: 3 },
    { userId: users[2].id, wins: 15, losses: 20, draws: 1, ranking: 1650, level: 10, xp: 2100, winStreak: 0 },
    { userId: users[3].id, wins: 40, losses: 8, draws: 5, ranking: 2100, level: 22, xp: 5800, winStreak: 8 },
    { userId: users[4].id, wins: 20, losses: 18, draws: 4, ranking: 1750, level: 12, xp: 2800, winStreak: 2 },
  ];

  for (const stats of gameStatsData) {
    await prisma.gameStats.create({ data: stats });
  }

  console.log('✅ Created game stats');

  // Create Achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: 'First Victory',
        description: 'Win your first match',
        icon: '🏆',
        category: 'wins',
        requirement: 1,
        xpReward: 100,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Winning Streak',
        description: 'Win 5 matches in a row',
        icon: '🔥',
        category: 'streak',
        requirement: 5,
        xpReward: 500,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Champion',
        description: 'Win 50 matches',
        icon: '👑',
        category: 'wins',
        requirement: 50,
        xpReward: 1000,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Dedicated Player',
        description: 'Play 100 matches',
        icon: '🎮',
        category: 'matches',
        requirement: 100,
        xpReward: 750,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Rising Star',
        description: 'Reach ranking 2000',
        icon: '⭐',
        category: 'ranking',
        requirement: 2000,
        xpReward: 1500,
      },
    }),
  ]);

  console.log(`✅ Created ${achievements.length} achievements`);

  // Unlock some achievements for users
  await Promise.all([
    // Alice unlocks "First Victory" and "Winning Streak"
    prisma.userAchievement.create({
      data: {
        userId: users[0].id,
        achievementId: achievements[0].id,
        progress: 25,
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[0].id,
        achievementId: achievements[1].id,
        progress: 5,
      },
    }),
    // Bob unlocks "First Victory" and "Dedicated Player"
    prisma.userAchievement.create({
      data: {
        userId: users[1].id,
        achievementId: achievements[0].id,
        progress: 30,
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[1].id,
        achievementId: achievements[3].id,
        progress: 48,
      },
    }),
    // Diana unlocks all achievements
    prisma.userAchievement.create({
      data: {
        userId: users[3].id,
        achievementId: achievements[0].id,
        progress: 40,
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[3].id,
        achievementId: achievements[1].id,
        progress: 8,
      },
    }),
    prisma.userAchievement.create({
      data: {
        userId: users[3].id,
        achievementId: achievements[4].id,
        progress: 2100,
      },
    }),
  ]);

  console.log('✅ Unlocked achievements for users');

  // Create Friendships
  await Promise.all([
    // Alice <-> Bob (accepted)
    prisma.friendship.create({
      data: {
        userId: users[0].id,
        friendId: users[1].id,
        status: 'accepted',
      },
    }),
    // Alice <-> Charlie (accepted)
    prisma.friendship.create({
      data: {
        userId: users[0].id,
        friendId: users[2].id,
        status: 'accepted',
      },
    }),
    // Bob <-> Diana (accepted)
    prisma.friendship.create({
      data: {
        userId: users[1].id,
        friendId: users[3].id,
        status: 'accepted',
      },
    }),
    // Charlie -> Diana (pending)
    prisma.friendship.create({
      data: {
        userId: users[2].id,
        friendId: users[3].id,
        status: 'pending',
      },
    }),
    // Eve -> Alice (pending)
    prisma.friendship.create({
      data: {
        userId: users[4].id,
        friendId: users[0].id,
        status: 'pending',
      },
    }),
    // Alice <-> Diana (accepted)
    prisma.friendship.create({
      data: {
        userId: users[0].id,
        friendId: users[3].id,
        status: 'accepted',
      },
    }),
  ]);

  console.log('✅ Created friendships');

  // Create Matches
  const matches = await Promise.all([
    // Alice vs Bob - Alice wins
    prisma.match.create({
      data: {
        player1Id: users[0].id,
        player2Id: users[1].id,
        winnerId: users[0].id,
        result: 'player1Win',
        score: '3-1',
        duration: 1200,
        playedAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
      },
    }),
    // Bob vs Charlie - Bob wins
    prisma.match.create({
      data: {
        player1Id: users[1].id,
        player2Id: users[2].id,
        winnerId: users[1].id,
        result: 'player1Win',
        score: '3-2',
        duration: 1800,
        playedAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
      },
    }),
    // Diana vs Alice - Diana wins
    prisma.match.create({
      data: {
        player1Id: users[3].id,
        player2Id: users[0].id,
        winnerId: users[3].id,
        result: 'player1Win',
        score: '3-0',
        duration: 900,
        playedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
      },
    }),
    // Alice vs Charlie - Draw
    prisma.match.create({
      data: {
        player1Id: users[0].id,
        player2Id: users[2].id,
        winnerId: null,
        result: 'draw',
        score: '2-2',
        duration: 1500,
        playedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      },
    }),
    // Bob vs Diana - Diana wins
    prisma.match.create({
      data: {
        player1Id: users[1].id,
        player2Id: users[3].id,
        winnerId: users[3].id,
        result: 'player2Win',
        score: '1-3',
        duration: 1350,
        playedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    }),
    // Eve vs Alice - Alice wins
    prisma.match.create({
      data: {
        player1Id: users[4].id,
        player2Id: users[0].id,
        winnerId: users[0].id,
        result: 'player2Win',
        score: '1-3',
        duration: 1100,
        playedAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
      },
    }),
  ]);

  console.log(`✅ Created ${matches.length} matches`);

  // Create Conversations and Messages
  // Conversation 1: Alice <-> Bob
  const conversation1 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: users[0].id },
          { userId: users[1].id },
        ],
      },
    },
  });

  await Promise.all([
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        senderId: users[0].id,
        receiverId: users[1].id,
        content: 'Hey Bob! Want to play a game?',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        senderId: users[1].id,
        receiverId: users[0].id,
        content: 'Sure! Let me finish this match first.',
        isRead: true,
        createdAt: new Date(Date.now() - 7000000),
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        senderId: users[0].id,
        receiverId: users[1].id,
        content: 'No problem, take your time!',
        isRead: true,
        createdAt: new Date(Date.now() - 6800000),
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation1.id,
        senderId: users[1].id,
        receiverId: users[0].id,
        content: "I'm ready now!",
        isRead: false,
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
      },
    }),
  ]);

  // Conversation 2: Alice <-> Diana
  const conversation2 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: users[0].id },
          { userId: users[3].id },
        ],
      },
    },
  });

  await Promise.all([
    prisma.message.create({
      data: {
        conversationId: conversation2.id,
        senderId: users[3].id,
        receiverId: users[0].id,
        content: 'Great match earlier!',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation2.id,
        senderId: users[0].id,
        receiverId: users[3].id,
        content: 'Thanks! You played really well. Any tips?',
        isRead: true,
        createdAt: new Date(Date.now() - 86000000),
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation2.id,
        senderId: users[3].id,
        receiverId: users[0].id,
        content: 'Focus on your defense in the early game.',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
      },
    }),
  ]);

  // Conversation 3: Bob <-> Charlie
  const conversation3 = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: users[1].id },
          { userId: users[2].id },
        ],
      },
    },
  });

  await Promise.all([
    prisma.message.create({
      data: {
        conversationId: conversation3.id,
        senderId: users[2].id,
        receiverId: users[1].id,
        content: 'Hey, have you seen the new tournament announcement?',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation3.id,
        senderId: users[1].id,
        receiverId: users[2].id,
        content: 'Yes! Are you planning to join?',
        isRead: false,
        createdAt: new Date(Date.now() - 172000000),
      },
    }),
  ]);

  console.log('✅ Created conversations and messages');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Achievements: ${achievements.length}`);
  console.log(`   - Matches: ${matches.length}`);
  console.log(`   - Friendships: 6`);
  console.log(`   - Conversations: 3`);
  console.log(`   - Messages: 9`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });