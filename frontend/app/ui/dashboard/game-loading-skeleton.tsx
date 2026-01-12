export default function GameLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="h-9 bg-white/10 rounded w-48 mb-2"></div>
          <div className="h-5 bg-white/10 rounded w-64"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-40 bg-green-500/20 border border-green-500/50 rounded-lg"></div>
          <div className="h-12 w-36 bg-white/5 border border-white/10 rounded-lg"></div>
        </div>
      </div>

      {/* Game Container Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Ambient glow effect */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-yellow-500/20 blur-3xl rounded-full animate-pulse" />

        <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-blue-900/50"
             style={{ minHeight: '600px' }}>
          <div className="text-center">
            {/* Animated Bird Icon */}
            <div className="mb-6 animate-bounce">
              <div className="text-7xl">🐦</div>
            </div>

            {/* Loading Text */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Loading Flappy Bird...
            </h2>

            {/* Spinner */}
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            </div>

            {/* Tip Text */}
            <p className="mt-6 text-slate-300 text-sm">
              Get ready to tap!
            </p>
          </div>
        </div>
      </div>

      {/* Controls Info Skeleton */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-5/6"></div>
          <div className="h-4 bg-white/10 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}
