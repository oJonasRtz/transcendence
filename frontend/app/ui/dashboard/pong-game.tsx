'use client';

import { useRouter } from 'next/navigation';
import type { User } from '@/app/lib/auth';
import { Pong } from '@/app/games/Pong';

interface PongGameProps {
  user: User;
}

export default function PongGame({ user }: PongGameProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Game Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative">
          <Pong
            match_id={user.match_id}
            name={user.username}
            user_id={user.user_id}
          />
        </div>
      </div>

      {/* Controls Info */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">▸</span>
            <span>Use ↑ and ↓ arrows or W and S to move your paddle</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">▸</span>
            <span>Hit the ball past your opponent to score</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">▸</span>
            <span>The first player to reach the score limit wins</span>
          </li>
        </ul>
      </div>

      {/* Back Button */}
      <div className="flex justify-end">
        <button
          onClick={() => router.push('/dashboard/play')}
          className="px-6 py-3 rounded-lg
                     bg-white/5 hover:bg-white/10
                     border border-white/10 hover:border-white/30
                     text-white
                     transition-all duration-300
                     flex items-center gap-2"
        >
          ← Back to Games
        </button>
      </div>
    </div>
  );
}
