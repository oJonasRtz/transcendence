'use client';

import { useRouter } from 'next/navigation';
import type { User } from '@/app/lib/auth';
import { Pong } from '@/app/games/Pong';
import MatchProvider, { match } from './MatchProvider';
import { useEffect } from 'react';

interface PongGameProps {
  user: User;
}

export default function PongGame({ user }: PongGameProps) {
  const router = useRouter();

  if (!match)
    router.push('/dashboard/play');

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (match.stats) {
  //       clearInterval(interval);
  //       router.push(`/dashboard/play/statsPage`);
  //     }
  //   }, 500);

  //   return () => clearInterval(interval);
  // }, [router]);

  return (
    <div className="space-y-6">
      <MatchProvider user={user} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pong</h1>
          <p className="text-slate-400">
            Hit the ball past your opponent! First to the score limit wins.
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/play')}
          className="px-6 py-3 rounded-lg
                     bg-white/5 hover:bg-white/10
                     border border-white/10 hover:border-white/30
                     text-white
                     transition-all duration-300
                     flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Games
        </button>
      </div>

      {/* Game Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative">
          <Pong />
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
    </div>
  );
}
