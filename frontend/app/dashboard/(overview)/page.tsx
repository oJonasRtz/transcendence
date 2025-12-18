// app/dashboard/page.tsx
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import StatsCards from '@/app/ui/dashboard/stats-cards';
import RecentMatches from '@/app/ui/dashboard/recent-matches';
import Leaderboard from '@/app/ui/dashboard/leaderboard';
import FriendsList from '@/app/ui/dashboard/friends-list';
import RecentMessages from '@/app/ui/dashboard/recent-messages';
import ActivityFeed from '@/app/ui/dashboard/activity-feed';
import {
  StatsCardsSkeleton,
  RecentMatchesSkeleton,
  LeaderboardSkeleton,
  FriendsListSkeleton,
  RecentMessagesSkeleton,
  ActivityFeedSkeleton,
} from '@/app/ui/dashboard/skeletons';

export default async function DashboardPage() {
  // TODO: Get userId from auth session
  const userId = 1;

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsCards userId={userId} />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<RecentMatchesSkeleton />}>
            <RecentMatches userId={userId} />
          </Suspense>

          <Suspense fallback={<ActivityFeedSkeleton />}>
            <ActivityFeed userId={userId} />
          </Suspense>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          <Suspense fallback={<LeaderboardSkeleton />}>
            <Leaderboard userId={userId} />
          </Suspense>

          <Suspense fallback={<FriendsListSkeleton />}>
            <FriendsList userId={userId} />
          </Suspense>

          <Suspense fallback={<RecentMessagesSkeleton />}>
            <RecentMessages userId={userId} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}