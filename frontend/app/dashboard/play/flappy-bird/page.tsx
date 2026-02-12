import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import FlappyBirdGame from '@/app/ui/dashboard/flappy-bird-game';
import FlappyLeaderboard from '@/app/ui/dashboard/flappyLeaderboard';
import { getDashboardData } from '@/app/lib/dashboard-data';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function FlappyBirdPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getDashboardData(user);

  return (
    <main className="p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-4 lg:gap-6">
        <FlappyBirdGame user={user} />
        <FlappyLeaderboard
          currentUserId={user.user_id}
          leaderboard={data.flappyLeaderboard}
        />
      </div>
    </main>
  );
}
