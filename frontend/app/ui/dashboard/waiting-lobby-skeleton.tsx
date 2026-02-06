export default function WaitingLobbySkeleton() {
	return (
	  <div className="space-y-6 animate-pulse">
		{/* Header Skeleton */}
		<div className="text-center space-y-3">
		  <div className="h-10 w-64 mx-auto rounded-lg bg-white/10" />
		  <div className="h-4 w-32 mx-auto rounded bg-purple-400/30" />
		</div>
  
		{/* Lobby Container */}
		<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8">
		  <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
		  <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />
  
		  <div className="relative flex flex-col items-center justify-center gap-8">
			{/* Players Grid Skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
			  {Array.from({ length: 4 }).map((_, i) => (
				<div key={i} className="relative">
				  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-30" />
				  <div className="relative rounded-xl border border-white/10 bg-slate-900/60 p-6 flex flex-col items-center gap-4 w-56">
					<div className="h-24 w-24 rounded-full bg-white/10" />
					<div className="h-4 w-32 rounded bg-white/10" />
					<div className="h-3 w-20 rounded bg-white/10" />
				  </div>
				</div>
			  ))}
			</div>
  
			{/* Timer Skeleton */}
			<div className="mt-4 h-6 w-24 rounded bg-green-400/20" />
  
			{/* Action Buttons Skeleton */}
			<div className="flex gap-4 w-full max-w-md">
			  <div className="flex-1 h-12 rounded-xl bg-green-500/20" />
			  <div className="flex-1 h-12 rounded-xl bg-red-500/20" />
			</div>
		  </div>
		</div>
  
		{/* Back Button Skeleton */}
		<div className="flex justify-end">
		  <div className="h-10 w-40 rounded-lg bg-white/10" />
		</div>
  
		{/* Players Info Skeleton */}
		<div className="rounded-lg border border-white/10 bg-white/5 p-6 mt-6 space-y-3">
		  <div className="h-5 w-40 rounded bg-white/10" />
		  <div className="h-3 w-64 rounded bg-white/10" />
		  <div className="h-3 w-56 rounded bg-white/10" />
		  <div className="h-3 w-72 rounded bg-white/10" />
		</div>
	  </div>
	);
}
  