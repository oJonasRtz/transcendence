'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import type { User } from '@/app/lib/auth';

interface FlappyBirdGameProps {
  user: User;
}

export default function FlappyBirdGame({ user }: FlappyBirdGameProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [gameKey, setGameKey] = useState(0);
  const gameUrl = `${process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://localhost:3000'}/flappy-bird`;

  const handleRestart = () => {
    // Force iframe reload by changing the key
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flappy Bird</h1>
          <p className="text-slate-400">
            Tap to flap! How far can you go?
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-lg
                       bg-green-500/20 hover:bg-green-500/30
                       border border-green-500/50 hover:border-green-500/70
                       text-green-400 hover:text-green-300
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Restart Game
          </button>

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
      </div>

      {/* Game Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Ambient glow effect */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-green-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-yellow-500/20 blur-3xl rounded-full" />

        <div className="relative">
          {/* Game iframe */}
          <iframe
            key={gameKey}
            ref={iframeRef}
            src={gameUrl}
            className="w-full aspect-video rounded-lg"
            style={{ minHeight: '600px' }}
            title="Flappy Bird Game"
            allow="accelerometer; gyroscope"
          />
        </div>
      </div>

      {/* Controls Info */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">▸</span>
            <span>Click or tap to make the bird flap</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">▸</span>
            <span>Avoid the pipes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">▸</span>
            <span>Try to beat your high score!</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">▸</span>
            <span>When you die, click the <strong className="text-green-300">"Restart Game"</strong> button above to play again</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-0.5">▸</span>
            <span>Or click inside the game area if that works too</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
