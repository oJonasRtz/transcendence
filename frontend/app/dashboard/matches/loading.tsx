import { InvoicesTableSkeleton } from '@/app/ui/skeletons';

export default function Loading() {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <div className="flex w-full items-center justify-between animate-pulse">
        <div className="h-8 bg-white/10 rounded w-32" />
      </div>

      {/* Search and Button Skeleton */}
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 animate-pulse">
        <div className="h-10 bg-white/5 border border-white/10 rounded-lg flex-1 max-w-md" />
        <div className="h-10 w-32 bg-blue-500/20 border border-blue-500/50 rounded-lg" />
      </div>

      {/* Table Skeleton */}
      <InvoicesTableSkeleton />

      {/* Pagination Skeleton */}
      <div className="mt-5 flex w-full justify-center animate-pulse">
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 bg-white/5 border border-white/10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
