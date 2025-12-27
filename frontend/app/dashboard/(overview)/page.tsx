// app/dashboard/page.tsx
import { Suspense } from 'react';
import StatsCards from '@/app/ui/dashboard/stats-cards';
import RecentMatches from '@/app/ui/dashboard/recent-matches';
import Leaderboard from '@/app/ui/dashboard/leaderboard';
import FriendsList from '@/app/ui/dashboard/friends-list';
import RecentMessages from '@/app/ui/dashboard/recent-messages';
import ActivityFeed from '@/app/ui/dashboard/activity-feed';
import UserProfileHeader from '@/app/ui/dashboard/user-profile-header';
import {
  StatsCardsSkeleton,
  RecentMatchesSkeleton,
  LeaderboardSkeleton,
  FriendsListSkeleton,
  RecentMessagesSkeleton,
  ActivityFeedSkeleton,
} from '@/app/ui/dashboard/skeletons';
import { getUserByEmail } from '@/app/lib/data';
import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  // Get authenticated user from JWT
  const authUser = await getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Get the Prisma user ID by matching email
  // The JWT contains backend user_id (UUID), but Prisma uses auto-increment id
  let prismaUser = await getUserByEmail(authUser.email);

  if (!prismaUser) {
    // User exists in auth DB but not in Prisma DB - attempt sync
    console.log('[Dashboard] User not found in Prisma, attempting sync:', authUser.email);
    
    try {
      const { getUserProfile } = await import('@/app/lib/backend-api');
      const { syncUserToPrisma } = await import('@/app/lib/sync');
      
      if (authUser.public_id) {
        const backendUser = await getUserProfile(authUser.public_id);
        
        if (backendUser) {
          // Pass email from JWT token since backend doesn't return it
          await syncUserToPrisma(backendUser, authUser.email);
          console.log('[Dashboard] User synced on-demand:', authUser.email);
          
          // Try to fetch again after sync
          prismaUser = await getUserByEmail(authUser.email);
        }
      }
    } catch (syncError) {
      console.error('[Dashboard] On-demand sync failed:', syncError);
    }
    
    // If still no user after sync attempt, show error message instead of redirect loop
    if (!prismaUser) {
      return (
        <main className="p-4 md:p-6 lg:p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Profile Sync Error</h2>
            <p className="text-red-600 mb-4">
              Unable to sync your profile. Please try logging out and logging back in.
            </p>
            <p className="text-sm text-red-500">
              Email: {authUser.email} | ID: {authUser.public_id}
            </p>
          </div>
        </main>
      );
    }
  }

  const userId = prismaUser.id;

  return (
    <main className="p-4 md:p-6 lg:p-8">

      <div className="grid place-items-center mb-6">
        <UserProfileHeader userId={userId} />
      </div>

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