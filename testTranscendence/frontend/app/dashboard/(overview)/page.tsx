import DashboardHero from '@/app/ui/dashboard/dashboard-hero';
import DashboardStats from '@/app/ui/dashboard/dashboard-stats';
import RecentMatches from '@/app/ui/dashboard/recent-matches';
import Leaderboard from '@/app/ui/dashboard/leaderboard';
import FriendsList from '@/app/ui/dashboard/friends-list';
import RecentMessages from '@/app/ui/dashboard/recent-messages';
import ActivityFeed from '@/app/ui/dashboard/activity-feed';
import { getUser } from '@/app/lib/auth';
import { getDashboardData } from '@/app/lib/dashboard-data';
import { redirect } from 'next/navigation';
//import MatchProvider from '@/app/ui/dashboard/MatchProvider';

export default async function DashboardPage() {
  // Get authenticated user from JWT
  const authUser = await getUser();

  if (!authUser) {
    redirect('/login');
  }

  const dashboardData = await getDashboardData(authUser);
  //const user = getUser();

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Web socket to match-service*/}

      <DashboardHero profile={dashboardData.profile} />

      <DashboardStats stats={dashboardData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentMatches />
          <ActivityFeed activity={dashboardData.activity} />
        </div>

        <div className="space-y-6">
          <Leaderboard
            leaderboard={dashboardData.leaderboard}
          />
          <FriendsList friends={dashboardData.friends} />
          <RecentMessages
            messages={dashboardData.messages}
            unreadCount={dashboardData.unreadCount}
          />
        </div>
      </div>
    </main>
  );
}
