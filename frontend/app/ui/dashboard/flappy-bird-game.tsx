'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@/app/lib/auth';
import FlappyBird from '@/app/games/FlappyBird';
import FlappyLeaderboard from './flappyLeaderboard';

interface FlappyBirdGameProps {
  user: User;
}

export default function FlappyBirdGame({ user }: FlappyBirdGameProps) {
  const router = useRouter();
  const [restartSignal, setRestartSignal] = useState(0);
  const [highScore, setHighScore] = useState(123); // Can be updated via API
  const [score, setScore] = useState(0); // Current player score


  const handleRestart = () => {
    setRestartSignal(prev => prev + 1);
    setScore(0); 
  };

  const saveHighScore = async (score: number) => {
    try {
      await fetch('/api/flappy', {
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
    <div className="min-h-screen flex flex-col items-center justify-start gap-10 px-6 py-10">
      {/* Header */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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

      {/* Game + Scores */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-6 relative">
        {/* Scores side by side */}
        <div className="flex w-full gap-4 mb-4">
          <div className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.5)] text-white font-bold text-lg backdrop-blur-sm text-center">
            Score: {score}
          </div>
          <div className="flex-1 px-4 py-2 rounded-lg bg-orange-500/70 border border-orange-400 shadow-[0_0_15px_rgba(255,165,0,0.7)] backdrop-blur-sm text-white font-bold text-lg text-center">
            High Score: {highScore}
          </div>
        </div>

        {/* Game container */}
        <div className="relative w-full flex flex-col items-center">
          <div className="relative w-full flex flex-col items-center">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 w-full h-96 lg:h-[450px]">
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
        </div>



         {/* How to Play below the game, width matches game container */}
        <div className="mt-6 w-full rounded-lg border border-white/10 bg-white/5 p-6 text-slate-400 text-sm">
          <h3 className="text-lg font-bold text-white mb-4">How to Play</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>Click, tap, press ↑ or Space to flap</span>
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
                When you die, click the <strong className="text-green-300">"Restart Game"</strong> button above or press <strong className="text-green-400">R</strong> to play again
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>Or click inside the game area if that works too</span>
            </li>
          </ul>
        </div>
        </div>
      </div>
    </div>
  );
}