import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import FlappyBirdGame from '@/app/ui/dashboard/flappy-bird-game';
import FlappyBird from '@/app/games/FlappyBird';
import FlappyLeaderboard from '@/app/ui/dashboard/flappyLeaderboard';
import { getDashboardData } from '@/app/lib/dashboard-data';

export default async function FlappyBirdPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  const data = await getDashboardData(user);

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="flex max-w-7xl mx-auto">
        <FlappyBirdGame user={user} />
        <FlappyLeaderboard
          currentUserId={user.user_id}
          leaderboard={data.flappyLeaderboard}  
        />
      </div>
    </main>
  );
}
