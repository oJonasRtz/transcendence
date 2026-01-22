"use client";

import { useRouter } from 'next/navigation';
import type { User } from '@/app/lib/auth';
import { useEffect, useState } from 'react';
// import { Crown } from 'lucide-react';

interface WaitingLobbyProps {
  user: User;
}

type GameType = 'RANKED' | 'TOURNAMENT';

type PlayerProfile = {
  public_id: string;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  isOnline?: boolean;
  isHost?: boolean;
};

export default function WaitingLobby({ user }: WaitingLobbyProps) {
  const router = useRouter();
  const [inQueue, setInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0); // tempo em segundos
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [gameType, setGameType] = useState<GameType>('RANKED');

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      try {
        const res = await fetch(
          `/api/profile?public_id=${encodeURIComponent(user.public_id)}`,
          { cache: 'no-store' }
        );

        if (res.ok) {
          const data = await res.json();
          setPlayers([
            {
              public_id: user.public_id,
              username: user.username,
              nickname: data?.nickname ?? user.nickname,
              avatar: data?.avatar ?? null,
              isOnline: data?.isOnline ?? true,
              isHost: true,
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch player profile:', err);
      }
    };

    fetchPlayerProfile();
  }, [user]);

  // Timer global
  useEffect(() => {
    if (!inQueue) {
      setQueueTime(0);
      return;
    }

    const interval = setInterval(() => {
      setQueueTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [inQueue]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          Waiting Room
        </h1>
        <p className="text-lg font-mono uppercase tracking-widest text-purple-400">
          // {gameType}
        </p>

        {/* Game Type Selector */}
        <div className="flex gap-4 justify-center mt-4">
		<button
			onClick={() => !inQueue && setGameType('RANKED')}
			className={`px-6 py-3 rounded-xl font-bold transition-all duration-300
			${gameType === 'RANKED' ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300'}
			${inQueue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}
			`}
		>
			Ranked
		</button>

		<button
			onClick={() => !inQueue && setGameType('TOURNAMENT')}
			className={`px-6 py-3 rounded-xl font-bold transition-all duration-300
			${gameType === 'TOURNAMENT' ? 'bg-purple-500 text-white' : 'bg-white/10 text-slate-300'}
			${inQueue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-600'}
			`}
		>
			Tournament
		</button>
		</div>

      </div>

      {/* Lobby Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative flex flex-col items-center gap-8">
          {/* Players Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {players.map((player) => (
              <div key={player.public_id} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition duration-300" />
                <div className="relative rounded-xl border border-white/10 bg-slate-900/60 p-6 flex flex-col items-center gap-4 w-56">
                  <img
                    src={player.avatar || '/images/default_avatar.png'}
                    alt="Player Avatar"
                    className="h-24 w-24 rounded-full border-4 border-white/20 shadow-xl object-cover"
                  />
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    {player.nickname || player.username || 'Player'}
                    {/* {player.isHost && (
                      <Crown
                        className="h-4 w-4 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
                        title="Room Owner"
                      />
                    )} */}
                  </p>
                  <span
                    className={`text-xs font-mono uppercase tracking-widest ${
                      inQueue ? 'text-green-400' : 'text-slate-400'
                    }`}
                  >
                    {inQueue ? 'IN QUEUE' : 'WAITING'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Timer abaixo dos players */}
          {inQueue && (
            <div className="mt-4 text-xl font-mono text-green-400 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
              ⏱ {formatTime(queueTime)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 w-full max-w-md">
            <button
              onClick={() => setInQueue(true)}
              disabled={inQueue}
              className={`flex-1 py-4 rounded-xl text-lg font-bold transition-all duration-300
                ${
                  inQueue
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40 cursor-not-allowed'
                    : 'bg-green-500/30 hover:bg-green-500/40 text-green-300 border border-green-500/50 shadow-lg shadow-green-500/20'
                }`}
            >
              Find Match
            </button>

            <button
              onClick={() => setInQueue(false)}
              className="flex-1 py-4 rounded-xl text-lg font-bold transition-all duration-300 bg-red-500/30 hover:bg-red-500/40 text-red-300 border border-red-500/50 shadow-lg shadow-red-500/20"
            >
              Leave Queue
            </button>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
			setInQueue(false);
			router.push('/dashboard/play');
		}}
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
