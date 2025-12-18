// app/ui/skeletons.tsx
export function StatsCardsSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </>
  );
}

export function RecentMatchesSkeleton() {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="h-16 animate-pulse bg-gray-200" />
      <div className="divide-y">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="h-20 animate-pulse bg-gray-200" />
      <div className="divide-y">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export function FriendsListSkeleton() {
  return (
    <div className="rounded-lg bg-white shadow">
      <div className="h-20 animate-pulse bg-gray-200" />
      <div className="divide-y">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export function RecentMessagesSkeleton() {
  return <FriendsListSkeleton />;
}

export function ActivityFeedSkeleton() {
  return <RecentMatchesSkeleton />;
}