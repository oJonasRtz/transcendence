export default function ProfileSkeleton() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-xl shadow-md p-6 animate-pulse">
        {/* Navigation skeleton */}
        <div className="flex gap-4 mb-6">
          <div className="h-4 w-16 bg-white/20 rounded" />
          <div className="h-4 w-24 bg-white/20 rounded" />
        </div>

        {/* Title skeleton */}
        <div className="h-8 w-40 bg-white/20 rounded mb-6" />

        {/* Profile header skeleton */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full bg-white/20 mb-4" />
          <div className="h-6 w-32 bg-white/20 rounded mb-2" />
          <div className="h-4 w-20 bg-white/20 rounded mb-2" />
          <div className="h-4 w-48 bg-white/20 rounded" />
        </div>

        {/* Actions skeleton */}
        <div className="flex gap-3 justify-center mb-6">
          <div className="h-10 w-28 bg-white/20 rounded-lg" />
          <div className="h-10 w-32 bg-white/20 rounded-lg" />
          <div className="h-10 w-20 bg-white/20 rounded-lg" />
        </div>

        {/* Stats skeleton */}
        <div className="mt-6">
          <div className="h-6 w-24 bg-white/20 rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4">
                <div className="h-3 w-12 bg-white/20 rounded mb-2 mx-auto" />
                <div className="h-5 w-16 bg-white/20 rounded mb-1 mx-auto" />
                <div className="h-2 w-10 bg-white/20 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
