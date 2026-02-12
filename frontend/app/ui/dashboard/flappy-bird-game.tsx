'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@/app/lib/auth';
import FlappyBird from '@/app/games/FlappyBird';

interface FlappyBirdGameProps {
  user: User;
}

export default function FlappyBirdGame({ user }: FlappyBirdGameProps) {
  const router = useRouter();
  const [restartSignal, setRestartSignal] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [score, setScore] = useState(0); // Current player score


  const handleRestart = () => {
    setRestartSignal(prev => prev + 1);
    setScore(0); // Reset score on restart
  };

  const saveHighScore = async (score: number) => {
    try {
      const res = await fetch('/api/flappy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setFlappyHighScore',
          user_id: user.user_id,
          score,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save high score (status ${res.status})`);
      }
      setHighScore(prev => Math.max(prev, score));
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  };

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch('/api/flappy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getFlappyHighScore',
            user_id: user.user_id,
          }),
        });
        const data = await res.json();
        if (res.ok && data.high_score !== undefined)
          setHighScore(data.high_score);
      } catch (error) {
        console.error('Failed to fetch high score:', error);
      }
    }

    fetchScore();
  }, [user.user_id, restartSignal]);

  useEffect(() => {
    const keyHandleDown = (e: KeyboardEvent) => {
      if (['r'].includes(e.key.toLowerCase())) handleRestart();
    };

    window.addEventListener('keydown', keyHandleDown);
    return () => window.removeEventListener('keydown', keyHandleDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start gap-6 sm:gap-10 px-3 sm:px-6 py-4 sm:py-10">
      {/* Header */}
      <div className="w-full max-w-6xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Flappy Bird</h1>
          <p className="text-sm sm:text-base text-slate-400">
            Tap to flap! How far can you go?
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg
                       bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40
                       border border-green-500/50 hover:border-green-500/70
                       text-green-400 hover:text-green-300
                       transition-all duration-300
                       flex items-center justify-center gap-2
                       text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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
            Restart
          </button>

          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard/play')}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg
                       bg-white/5 hover:bg-white/10 active:bg-white/15
                       border border-white/10 hover:border-white/30
                       text-white
                       transition-all duration-300
                       flex items-center justify-center gap-2
                       text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
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
            Back
          </button>
        </div>
      </div>

      {/* Game + Scores */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-4 sm:gap-6 relative">
        {/* Scores side by side */}
        <div className="flex w-full gap-2 sm:gap-4">
          <div className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-white/10 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.5)] text-white font-bold text-sm sm:text-lg backdrop-blur-sm text-center">
            Score: {score}
          </div>
          <div className="flex-1 px-3 sm:px-4 py-2 rounded-lg bg-orange-500/70 border border-orange-400 shadow-[0_0_15px_rgba(255,165,0,0.7)] backdrop-blur-sm text-white font-bold text-sm sm:text-lg text-center">
            High Score: {highScore}
          </div>
        </div>

        {/* Game container */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/20 w-full max-w-[960px] aspect-[16/9]">
          {/* Ambient glow */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-green-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative w-full h-full">
            <FlappyBird
              restartSignal={restartSignal}
              setScore={setScore}
              saveHighScore={saveHighScore}
            />
          </div>
        </div>

        {/* How to Play below the game, width matches game container */}
        <div className="mt-4 sm:mt-6 w-full max-w-[960px] rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6 text-slate-400 text-sm">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">How to Play</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>Tap the screen or press Space / ↑ to flap</span>
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
              <span>
                When you die, tap <strong className="text-green-300">"Restart"</strong> above or press <strong className="text-green-400">R</strong> to play again
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
