'use client';

import { useRouter } from 'next/navigation';
import type { User } from '@/app/lib/auth';
import MatchProvider, { match } from './MatchProvider';
import { useEffect, useState } from 'react';

interface StatusPageProps {
  user: User;
}

export default function StatusPage({ user }: StatusPageProps) {
  const router = useRouter();
  const [stats, setStats] = useState(match.stats);

  useEffect(() => {
    if (!match.stats) router.push('/dashboard/play');
    setStats(match.stats);

    return () => {
      match.resetStats();
      match.leaveParty();
    }
  }, []);

  if (!stats) return null;

  const isWin = stats.result === 'WIN';
  const title = isWin ? 'Victory' : 'Defeat';

  const handleBack = (url: string) => {
    match.resetStats();
    match.leaveParty();
    router.push(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-3xl font-bold mb-2 ${
              isWin ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {title}
          </h1>
          <p className="text-slate-400">ID #{stats.match_id}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleBack('/dashboard/play/waiting-lobby')}
            className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white transition-all duration-300 flex items-center gap-2"
          >
            Back to Lobby
          </button>

          <button
            onClick={() => handleBack('/dashboard/play')}
            className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white transition-all duration-300 flex items-center gap-2"
          >
            Back to Games
          </button>
        </div>
      </div>

      {/* Stats Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 space-y-6">
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />
          <p className='text-slate-400'>
            //{stats.stats.game_type}
          </p>
        {/* Match Summary */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400 text-sm">//Duration</p>
            <p className="text-xl font-bold text-white">
              {stats.stats.time.duration}
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400 text-sm">//Points</p>
            <p className="text-xl font-bold text-white">
              +{stats.experienceGained} XP
            </p>
            <p className="text-xl font-bold text-white">
              {stats.pts > 0 ? '+' : ''}{stats.pts} RP
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400 text-sm">//New Rank</p>
            <p className="text-xl font-bold text-white">{stats.tier}</p>
            <p className="text-sm text-slate-400">{stats.rank_points} RP</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-slate-400 text-sm">//New level</p>
            <p className="text-xl font-bold text-white">{stats.level}</p>
            <p className="text-sm text-slate-400">
              {stats.experience_points} XP
            </p>
          </div>
        </div>

        {/* Players */}
        <div className="relative rounded-lg border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Players</h3>
          <div className="space-y-3">
            {Object.values(stats.stats.players).map((player) => {
              const avatarUrl = `/public/uploads/avatar_${player.id}.png`;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-lg border border-white/10 p-4 ${
                    player.winner
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={avatarUrl}
                      alt={`${player.name} avatar`}
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          '/public/uploads/default_avatar.png';
                      }}
                    />
                    <div>
                      <p className="text-white font-bold">{player.name}</p>
                      <p className="text-sm text-slate-400">//{player.tier}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{player.score}</p>
                    <p
                      className={`text-sm ${
                        player.winner ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {player.winner ? 'Winner' : 'Loser'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Useful infos */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Useful info</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">▸</span>
            <span>RP - Rank Points</span>
          </li>
        </ul>
      </div>
      </div>
    </div>
  );
}
