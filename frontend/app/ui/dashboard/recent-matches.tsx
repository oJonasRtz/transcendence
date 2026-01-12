// app/ui/dashboard/recent-matches.tsx
import { getMatchHistory } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';

export default async function RecentMatches({ userId }: { userId: number }) {
  const matches = await getMatchHistory(userId, 5);

  return (
    <div className="rounded-lg bg-slate-900/50 backdrop-blur-sm border border-white/10 shadow-2xl">
      <div className="border-b border-white/10 p-6">
        <h2 className="text-xl font-black tracking-tight text-white uppercase">
          <span className="text-purple-400">//</span> Recent Matches
        </h2>
      </div>

      <div className="divide-y divide-white/5">
        {matches.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-500 font-mono text-sm">// NO MATCHES PLAYED YET</p>
          </div>
        ) : (
          matches.map((match) => {
            const opponent =
              match.player1Id === userId ? match.player2 : match.player1;
            const isWin =
              (match.player1Id === userId && match.result === 'player1Win') ||
              (match.player2Id === userId && match.result === 'player2Win');
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
                        src={opponent.avatar}
                        alt={opponent.username}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white/10 group-hover:border-purple-400/50 transition-colors"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{opponent.username}</p>
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
          href="/matches"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all matches 
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}