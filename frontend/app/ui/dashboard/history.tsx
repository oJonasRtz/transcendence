// app/ui/dashboard/MatchHistoryList.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

export type MatchPlayer = {
  user_id: string;
  name: string;
  score: number;
  avatar: string;
  public_id: string;
};

export type MatchHistoryItem = {
  match_id: string | number;
  created_at: string;
  game_type: string;
  duration: string;
  isVictory: boolean;
  players: MatchPlayer[];
};

interface MatchHistoryListProps {
  userId: string;
  history: MatchHistoryItem[];
}

export default function MatchHistoryList({ userId, history }: MatchHistoryListProps) {
  // Trunca nomes longos
  const truncateName = (name: string) => {
    if (!name) return "Unknown";
    return name.length > 6 ? name.slice(0, 6) + "…" : name;
  };

  // Formata score com 2 dígitos
  const formatScore = (score: string) => {
    if (!score) return "";
    const [a, b] = score.split("-").map(Number);
    return `${a.toString().padStart(2, "0")}-${b.toString().padStart(2, "0")}`;
  };

  return (
    <div className="divide-y divide-white/5">
      {history.length === 0 ? (
        <p className="text-gray-400 text-sm p-4">No matches yet.</p>
      ) : (
        history.map((match) => {
          const currentPlayer = match.players.find((p) => p.user_id === userId);
          const opponent = match.players.find((p) => p.user_id !== userId);
          const isWin = match.isVictory;
          const score =
            currentPlayer && opponent
              ? `${currentPlayer.score}-${opponent.score}`
              : null;

          return (
            <div
              key={match.match_id}
              className="p-4 transition-all duration-300 hover:bg-white/5 group"
            >
              <div className="flex gap-2 items-center justify-between">
                {/* Opponent */}
                <Link
                  href={`/profile/${opponent?.public_id || ""}`}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <Image
                      src={opponent?.avatar || "/default-avatar.png"}
                      alt={opponent?.name || "Opponent"}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-white/10 group-hover:border-blue-400/50 transition-colors"
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-white">
                      {truncateName(opponent?.name || "Unknown")}
                    </p>
                    <p className="text-sm font-mono text-slate-400">
                      {match.created_at}
                    </p>
                  </div>
                </Link>

                {/* Stats */}
                <div className="flex items-center space-x-2 justify-between">
                  <span className="flex items-center justify-center text-xs font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {match.game_type}
                  </span>

                  <span className="flex items-center justify-center text-xs font-mono text-slate-500 px-2 py-0.5">
                    {match.duration}
                  </span>

                  {score && (
                    <span className="flex items-center justify-center font-mono text-sm text-slate-300 bg-white/5 px-3 py-0.5 rounded-lg border border-white/10">
                      {formatScore(score)}
                    </span>
                  )}

                  <span
                    className={`flex items-center justify-center rounded-lg w-[56px] py-0.5 text-sm font-black font-mono uppercase tracking-wider border ${
                      isWin
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {isWin ? "Win " : "Loss"}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
