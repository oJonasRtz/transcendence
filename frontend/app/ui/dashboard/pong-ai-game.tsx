'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/app/lib/auth';
import PongAI, { type PongAIScore, type PongAIWinner } from '@/app/games/PongAI';

interface PongAIGameProps {
  user: User;
}

const MAX_SCORE = 7;

export default function PongAIGame({ user }: PongAIGameProps) {
  const router = useRouter();
  const [restartSignal, setRestartSignal] = useState(0);
  const [score, setScore] = useState<PongAIScore>({ player: 0, ai: 0 });
  const [winner, setWinner] = useState<PongAIWinner | null>(null);

  const handleScore = useCallback((next: PongAIScore) => {
    setScore(next);
  }, []);

  const handleGameEnd = useCallback((nextWinner: PongAIWinner) => {
    setWinner(nextWinner);
  }, []);

  const restart = () => {
    setWinner(null);
    setScore({ player: 0, ai: 0 });
    setRestartSignal((previous) => previous + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pong vs AI</h1>
          <p className="text-slate-400">
            Local single-player mode. First to {MAX_SCORE} points wins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={restart}
            className="px-6 py-3 rounded-lg
                       bg-cyan-500/20 hover:bg-cyan-500/30
                       border border-cyan-500/50 hover:border-cyan-500/70
                       text-cyan-300
                       transition-all duration-300
                       flex items-center gap-2"
          >
            Restart Match
          </button>
          <button
            onClick={() => router.push('/dashboard/play')}
            className="px-6 py-3 rounded-lg
                       bg-white/5 hover:bg-white/10
                       border border-white/10 hover:border-white/30
                       text-white
                       transition-all duration-300
                       flex items-center gap-2"
          >
            Back to Games
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-blue-300/80 mb-1">Player</p>
          <p className="text-2xl font-black text-white">{score.player}</p>
          <p className="text-xs text-slate-300 mt-1">{user.username}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 flex items-center justify-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            {winner ? `${winner === 'player' ? 'You Win' : 'AI Wins'}` : 'In Progress'}
          </p>
        </div>
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-cyan-300/80 mb-1">AI</p>
          <p className="text-2xl font-black text-white">{score.ai}</p>
          <p className="text-xs text-slate-300 mt-1">Adaptive bot</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4">
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-cyan-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="relative flex justify-center">
          <PongAI
            restartSignal={restartSignal}
            maxScore={MAX_SCORE}
            onScoreChange={handleScore}
            onGameEnd={handleGameEnd}
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">▸</span>
            <span>Move with W/S or Arrow Up/Arrow Down</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">▸</span>
            <span>The AI predicts rebounds but has capped movement speed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">▸</span>
            <span>Ball speed increases after each paddle hit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">▸</span>
            <span>Use Restart Match to start a fresh scoreline anytime</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
