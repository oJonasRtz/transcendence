import { Suspense } from 'react';
import { getUser } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import GameLobby from '@/app/ui/dashboard/game-lobby';
import LoadingSkeleton from '@/app/ui/dashboard/loading-skeleton';

export default async function PlayPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Play Pong</h1>
          <p className="text-slate-400">
            Join the queue to find an opponent and start playing!
          </p>
        </div>

        {/* Game Lobby */}
        <Suspense fallback={<LoadingSkeleton />}>
          <GameLobby user={user} />
        </Suspense>
      </div>
    </main>
  );
}
