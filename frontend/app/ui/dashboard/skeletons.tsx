
const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

export function StatsCardsSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div 
          key={i} 
          className={`h-32 rounded-lg bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10 backdrop-blur-sm ${shimmer}`}
        >
          <div className="p-6 flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
              <div className="h-8 w-16 bg-white/30 rounded animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-lg border border-white/20 animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}

export function RecentMatchesSkeleton() {
  return (
    <div className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${shimmer}`}>
      <div className="border-b border-white/10 p-6">
        <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-white/5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <div className="h-12 w-12 bg-white/20 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-8 w-16 bg-white/20 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${shimmer}`}>
      <div className="border-b border-white/10 p-6">
        <div className="h-6 w-40 bg-white/20 rounded animate-pulse mb-2" />
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-white/5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <div className="h-4 w-8 bg-white/20 rounded animate-pulse" />
            <div className="h-10 w-10 bg-white/20 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-28 bg-white/20 rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-5 w-12 bg-blue-500/30 rounded animate-pulse" />
              <div className="h-3 w-8 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FriendsListSkeleton() {
  return (
    <div className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${shimmer}`}>
      <div className="border-b border-white/10 p-6">
        <div className="h-6 w-44 bg-white/20 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-white/5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/20 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-16 bg-green-500/30 rounded animate-pulse" />
            </div>
            <div className="h-5 w-5 bg-blue-500/30 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentMessagesSkeleton() {
  return (
    <div className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${shimmer}`}>
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 bg-white/20 rounded animate-pulse" />
          <div className="h-6 w-8 bg-red-500/30 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-start space-x-3">
            <div className="h-12 w-12 bg-white/20 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-48 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className={`rounded-lg bg-slate-900/80 backdrop-blur-sm border border-white/10 shadow-2xl ${shimmer}`}>
      <div className="border-b border-white/10 p-6">
        <div className="h-6 w-48 bg-white/20 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-white/5">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-3">
            <div className="h-10 w-10 bg-white/20 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-64 bg-white/20 rounded animate-pulse" />
              <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}