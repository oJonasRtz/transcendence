// app/ui/dashboard/leaderboard.tsx
import { getLeaderboard, getUserRankPosition } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default async function Leaderboard({ userId }: { userId: number }) {
  const [leaderboard, userRank] = await Promise.all([
    getLeaderboard(10),
    getUserRankPosition(userId),
  ]);

  return (
    <div className="rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-2xl">
      <div className="border-b border-white/10 p-6">
        <h2 className="text-xl font-black tracking-tight text-white uppercase">
          <span className="text-blue-400">//</span> Leaderboard
        </h2>
        {userRank && (
          <p className="mt-2 text-sm font-mono text-slate-400">
            <span className="text-blue-400">Your Rank:</span> #{userRank}
          </p>
        )}
      </div>

      <div className="divide-y divide-white/5">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.user.id === userId;
          const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-500'];

          return (
            <div
              key={entry.id}
              className={`flex items-center space-x-4 p-4 transition-all duration-300 ${
                isCurrentUser 
                  ? 'bg-blue-500/10 border-l-4 border-blue-500' 
                  : 'hover:bg-white/5'
              }`}
            >
              <span
                className={`w-8 text-lg font-black ${
                  index < 3 ? rankColors[index] : 'text-slate-500'
                }`}
              >
                #{index + 1}
              </span>

              <div className="relative">
                <Image
                  src={entry.user.avatar}
                  alt={entry.user.username}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white/10"
                />
                {entry.user.isOnline && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse"></span>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-white">{entry.user.username}</p>
              </div>

              <div className="text-right">
                <p className="font-black text-blue-400 text-lg">{entry.ranking}</p>
                <p className="text-xs font-mono uppercase text-slate-500">ELO</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/leaderboard"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View full leaderboard 
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
