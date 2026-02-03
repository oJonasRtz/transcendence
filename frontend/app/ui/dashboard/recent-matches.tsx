// app/ui/dashboard/recent-matches.tsx
import Image from 'next/image';
import Link from 'next/link';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';
import { getMatchHistory } from './dashboard-stats';
import { getUser } from '@/app/lib/auth';

type MatchPlayer = {
  user_id: string;
  name: string;
  score: number;
  avatar: string;
  public_id: string;
};

type MatchHistoryItem = {
  match_id: number;
  created_at: string;
  game_type: string;
  duration: string;
  isVictory: boolean;
  players: MatchPlayer[];
};

export default async function RecentMatches() {
  const [historyData, user] = await Promise.all([getMatchHistory(), getUser()]);
  const matches: MatchHistoryItem[] = historyData?.history ?? [];

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
            const opponent = match.players.find((p) => p.user_id !== user?.user_id);
            const currentPlayer = match.players.find((p) => p.user_id === user?.user_id);
            const isWin = match.isVictory;
            const score = currentPlayer && opponent
              ? `${currentPlayer.score} - ${opponent.score}`
              : null;

            return (
              <div
                key={match.match_id}
                className="p-4 transition-all duration-300 hover:bg-white/5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Link
                      href={`/profile/${opponent?.public_id || ''}`}
                      className="flex items-center space-x-3"
                    >
                    <div className="relative">
                      <Image
                        src={opponent?.avatar || '/default-avatar.png'}
                        alt={opponent?.name || 'Opponent'}
                        width={48}
                        height={48}
                        className="rounded-full border-2 border-white/10 group-hover:border-purple-400/50 transition-colors"
                      />
                    </div>
                    </Link>
                    <div>
                      <p className="font-semibold text-white">{opponent?.name || 'Unknown'}</p>
                      <p className="text-sm font-mono text-slate-400">
                        {match.created_at}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-mono text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">
                      {match.game_type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {match.duration}
                    </span>
                    {score && (
                      <span className="font-mono text-sm text-slate-300 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                        {score}
                      </span>
                    )}
                    <span
                      className={`rounded-lg px-3 py-1 text-sm font-black uppercase tracking-wider border ${
                        isWin
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      {isWin ? 'Win' : 'Loss'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* <div className="border-t border-white/10 p-4 bg-white/5">
        <Link
          href="/dashboard/matches"
          className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors font-mono uppercase tracking-wider group"
        >
          View all matches
          <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div> */}
    </CardShell>
  );
}
