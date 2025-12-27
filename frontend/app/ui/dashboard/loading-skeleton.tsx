export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-white/10 pb-4">
        <div className="h-7 bg-white/10 rounded w-48 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-96"></div>
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-6">
        <div>
          <div className="h-5 bg-white/10 rounded w-32 mb-2"></div>
          <div className="h-12 bg-white/5 border border-white/10 rounded-lg"></div>
        </div>

        <div>
          <div className="h-5 bg-white/10 rounded w-32 mb-2"></div>
          <div className="h-12 bg-white/5 border border-white/10 rounded-lg"></div>
        </div>

        {/* Button Skeleton */}
        <div className="flex justify-end">
          <div className="h-12 bg-blue-500/20 border border-blue-500/50 rounded-lg w-24"></div>
        </div>
      </div>
    </div>
  );
}
