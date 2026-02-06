// app/ui/dashboard/leaderboard.tsx
"use client";

import Link from 'next/link';
import {
  DashboardLeaderboardEntry,
} from '@/app/lib/dashboard-data';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';
import { useRouter } from 'next/navigation';

type LeaderboardProps = {
  leaderboard: DashboardLeaderboardEntry[];
  userRank?: number;
};

export default async function Leaderboard({
  leaderboard,
  userRank,
}: LeaderboardProps) {

  const truncateName = (name: string) => {
    if (!name) return "Unknown";
    return name.length > 6 ? name.slice(0, 6) + "…" : name;
  };

  const router = useRouter();

  // console.log('leaderboard: ' + JSON.stringify(leaderboard));

  return (
    <CardShell>
      <CardHeader
        title="Leaderboard"
        accentClassName="text-blue-400"
        subtitle={userRank ? `Your Rank: #${userRank}` : undefined}
      />

      <div className="divide-y divide-white/5 overflow-hidden">
        {leaderboard.length === 0 ? (
          <EmptyState
            title="No leaderboard data"
            message="Play matches to get ranked."
          />
        ) : (
          leaderboard.map((entry, index) => {
            const rankColors = ['text-yellow-400', 'text-slate-300', 'text-orange-500'];

            return (
              <div
                key={entry.id}
                className="flex items-center space-x-4 p-4 transition-all duration-300 hover:bg-white/5"
              >
                <span
                  className={`w-8 text-lg font-black ${
                    index < 3 ? rankColors[index] : 'text-slate-500'
                  }`}
                >
                  #{index + 1}
                </span>
                
                {/* <button
                  key={entry.id}
                  onClick={() => router.push(`/profile/${entry.public_id}`)}
                  className='flex items-center gap-4 flex-1'
                >
                  <div className="relative">
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      // width={40}
                      // height={40}
                      className="w-10 h-10 rounded-full border-2 border-white/10 flex-shrink-0"
                    />

                    {entry.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold flex justify-start text-white">{truncateName(entry.username)}</p>
                  </div>
                </button> */}

                <button
                  key={entry.id}
                  onClick={() => router.push(`/profile/${entry.public_id}`)}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="relative flex-shrink-0 rounded-2xl p-[2px] border border-blue-600 shadow-2xl group-hover:border-purple-500 transition-colors">
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="w-10 h-10 rounded-full border-2 border-white/10 object-cover"
                    />

                    {entry.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse" />
                    )}
                  </div>

                  <div className="flex justify-start flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {entry.username || "Unknown"}
                    </p>
                  </div>
                </button>



                <div className="text-right flex flex-col justify-end">
                  <p className="font-black text-blue-400 text-lg">{entry.tier}</p>
                  <p className="text-xs font-mono uppercase text-slate-500">{entry.rankPoints} RP</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/dashboard/leaderboard"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View full leaderboard
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div> */}
    </CardShell>
  );
}
