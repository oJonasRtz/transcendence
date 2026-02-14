'use client';

import { useState, useEffect } from 'react';
import { joinQueue, leaveQueue } from '@/app/actions/game';
import type { User } from '@/app/lib/auth';
import {useRouter} from 'next/navigation';

type QueueStatus = 'idle' | 'searching' | 'matched' | 'playing';
type GameType = 'pong' | 'flappy-bird' | 'pong-ai';

interface GameLobbyProps {
  user: User;
}

export default function GameLobby({ user }: GameLobbyProps) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState(0);
  const [selectedGame, setSelectedGame] = useState<GameType>('flappy-bird');

  const router = useRouter();

  // Timer for showing how long user has been searching
  useEffect(() => {
    if (queueStatus === 'searching') {
      const interval = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setSearchTime(0);
    }
  }, [queueStatus]);

  const handleJoinQueue = async () => {
    setError(null);
    setQueueStatus('searching');

    const result = await joinQueue();

    if (result.error) {
      setError(result.error);
      setQueueStatus('idle');
      return;
    }

    // For now, simulate match found after 3 seconds
    // TODO: Replace with real WebSocket listener for match events
    setTimeout(() => {
      setQueueStatus('matched');

      // Redirect to game-pong after showing "Match Found" for 2 seconds
      setTimeout(() => {
        // TODO: Get real matchId from match-service
        const matchId = Math.floor(Math.random() * 10000);
        const playerId = user.user_id;

        // Redirect to game-pong container
        window.location.href = `/pong-game?matchId=${matchId}&playerId=${playerId}&name=${encodeURIComponent(user.username)}`;
      }, 2000);
    }, 3000);
  };

  const handleLeaveQueue = async () => {
    setError(null);
    const result = await leaveQueue();

    if (result.error) {
      setError(result.error);
    } else {
      setQueueStatus('idle');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (selectedGame === 'flappy-bird') {
      router.push('/dashboard/play/flappy-bird');
      return;
    }

    if (selectedGame === 'pong-ai') {
      router.push('/dashboard/play/pong-ai');
      return;
    }

    router.push('/dashboard/play/waiting-lobby');
  };

  const gameLabel =
    selectedGame === 'flappy-bird'
      ? 'Flappy Bird'
      : selectedGame === 'pong-ai'
        ? 'Pong vs AI'
        : 'Pong Multiplayer';

  const actionLabel =
    selectedGame === 'flappy-bird'
      ? 'Flappy Time!'
      : selectedGame === 'pong-ai'
        ? 'Challenge AI'
        : 'Find Match';

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10">
          <p className="text-sm text-red-400 font-mono">ERROR: {error}</p>
        </div>
      )}

      {/* Queue Status Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
        {/* Ambient glow effect */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative p-8">
          {/* Idle State */}
          {queueStatus === 'idle' && (
            <div className="text-center space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose Your Game
                </h2>
                <p className="text-slate-400">
                  Select a game to play
                </p>
              </div>

              {/* Game Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Flappy Bird Card */}
                <button
                  onClick={() => setSelectedGame('flappy-bird')}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-300
                    ${selectedGame === 'flappy-bird'
                      ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                >
                  <div className="text-4xl mb-3">🐦</div>
                  <h3 className="text-lg font-bold text-white mb-1">Flappy Duck</h3>
                  <p className="text-sm text-slate-400">Single Player</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-xs">
                    Available Now
                  </span>
                </button>

                <button
                  onClick={() => setSelectedGame('pong-ai')}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-300
                    ${selectedGame === 'pong-ai'
                      ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/40'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                >
                  <div className="text-4xl mb-3">🤖</div>
                  <h3 className="text-lg font-bold text-white mb-1">Pong vs AI</h3>
                  <p className="text-sm text-slate-400">Single Player</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs">
                    Available Now
                  </span>
                </button>

                {/* Pong Card */}
                <button
                  onClick={() => setSelectedGame('pong')}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-300
                    ${selectedGame === 'pong'
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/50'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                >
                  <div className="text-4xl mb-3">🏓</div>
                  <h3 className="text-lg font-bold text-white mb-1">Pong</h3>
                  <p className="text-sm text-slate-400">Multiplayer</p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs">
                    Competitive
                  </span>
                </button>
              </div>

              <button
                onClick={handlePlay}
                // disabled={selectedGame === 'pong'}
                className="group relative px-12 py-4 rounded-lg
                           bg-gradient-to-r from-blue-500 to-purple-600
                           hover:from-blue-600 hover:to-purple-700
                           text-white font-bold text-lg
                           transform transition-all duration-300
                           hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500
                                opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 -z-10" />
                {actionLabel}
              </button>

              {/* {selectedGame === 'flappy-bird' ? (
                <button
                  onClick={() => window.location.href = '/dashboard/play/flappy-bird'}
                  className="group relative px-12 py-4 rounded-lg
                            bg-gradient-to-r from-blue-500 to-purple-600
                            hover:from-blue-600 hover:to-purple-700
                            text-white font-bold text-lg
                            transform transition-all duration-300
                            hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
                >
                  Play Flappy Bird
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/dashboard/play/ranked'}
                    className="group relative px-10 py-4 rounded-lg
                              bg-purple-500/20 hover:bg-purple-500/30
                              border border-purple-500/50 hover:border-purple-500/70
                              text-purple-400 hover:text-purple-300
                              font-bold transition-all duration-300"
                  >
                    Play Ranked
                  </button>

                  <button
                    onClick={() => window.location.href = '/dashboard/play/tournament'}
                    className="group relative px-10 py-4 rounded-lg
                              bg-yellow-500/20 hover:bg-yellow-500/30
                              border border-yellow-500/50 hover:border-yellow-500/70
                              text-yellow-400 hover:text-yellow-300
                              font-bold transition-all duration-300"
                  >
                    Join Tournament
                  </button>
                </div>
              )} */}

            </div>
          )}

          {/* Searching State */}
          {queueStatus === 'searching' && (
            <div className="text-center space-y-6">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 border-2 border-blue-500/50 mb-4 animate-pulse">
                  <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Searching for Opponent...
                </h2>
                <p className="text-slate-400">
                  Time in queue: <span className="text-blue-400 font-mono">{formatTime(searchTime)}</span>
                </p>
              </div>

              {/* Loading dots animation */}
              <div className="flex justify-center gap-2 mb-6">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>

              <button
                onClick={handleLeaveQueue}
                className="px-8 py-3 rounded-lg
                           bg-red-500/20 hover:bg-red-500/30
                           border border-red-500/50 hover:border-red-500/70
                           text-red-400 hover:text-red-300
                           transition-all duration-300"
              >
                Leave Queue
              </button>
            </div>
          )}

          {/* Matched State */}
          {queueStatus === 'matched' && (
            <div className="text-center space-y-6">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 mb-4">
                  <svg
                    className="w-10 h-10 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Match Found!
                </h2>
                <p className="text-slate-400">
                  Connecting you to the game...
                </p>
              </div>
            </div>
          )}

          {/* Playing State */}
          {queueStatus === 'playing' && (
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Game In Progress
              </h2>
              <div className="aspect-video bg-black/60 rounded-lg border border-white/10 flex items-center justify-center">
                <p className="text-slate-400">Game canvas will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Card - Dynamic based on selected game */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          How to Play {gameLabel}
        </h3>

        {selectedGame === 'flappy-bird' ? (
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>Click or tap anywhere to make the bird flap its wings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>Navigate through the gaps between pipes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>Don't hit the pipes or the ground!</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>Each pipe you pass gives you 1 point</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>When you crash, click inside the game to restart</span>
            </li>
          </ul>
        ) : selectedGame === 'pong-ai' ? (
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <span>Use <kbd className="px-2 py-1 text-xs rounded bg-white/10 border border-white/20">W</kbd>/<kbd className="px-2 py-1 text-xs rounded bg-white/10 border border-white/20">S</kbd> or Arrow Keys</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <span>The AI tracks the ball and reacts with limited speed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <span>First side to reach 7 points wins</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-0.5">▸</span>
              <span>Use restart to instantly start a new match</span>
            </li>
          </ul>
        ) : (
          <ul className="space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Click "Find Match" to join the matchmaking queue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Wait for an opponent to be found</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>Use <kbd className="px-2 py-1 text-xs rounded bg-white/10 border border-white/20">W</kbd> and <kbd className="px-2 py-1 text-xs rounded bg-white/10 border border-white/20">S</kbd> or Arrow Keys to control your paddle</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">▸</span>
              <span>First player to reach 11 points wins!</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
