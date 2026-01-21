// app/ui/dashboard/recent-matches.tsx
import Image from 'next/image';
import Link from 'next/link';
import { DashboardMatch } from '@/app/lib/dashboard-data';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';

type RecentMatchesProps = {
  matches?: DashboardMatch[];
};

export default async function RecentMatches({
  matches = [],
}: RecentMatchesProps) {

  return (
    <CardShell>
      <CardHeader title="Recent Matches" accentClassName="text-purple-400" />

      <div className="divide-y divide-white/5">
        {matches.length === 0 ? (
          <EmptyState
            title="No matches yet"
            message="Play your first match to see results here."
          />
        ) : (
          matches.map((match) => {
            const isWin = match.result === 'win';
            const isDraw = match.result === 'draw';

            return (
              <div
                key={match.id}
                className="p-4 transition-all duration-300 hover:bg-white/5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Image
                        src={match.opponentAvatar}
                        alt={match.opponentName}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white/10 group-hover:border-purple-400/50 transition-colors"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{match.opponentName}</p>
                      <p className="text-sm font-mono text-slate-400">
                        {new Date(match.playedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {match.score && (
                      <span className="font-mono text-sm text-slate-300 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                        {match.score}
                      </span>
                    )}
                    <span
                      className={`rounded-lg px-3 py-1 text-sm font-black uppercase tracking-wider border ${
                        isWin
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : isDraw
                          ? 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {isWin ? 'Win' : isDraw ? 'Draw' : 'Loss'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/dashboard/matches"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all matches
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </CardShell>
  );
}
