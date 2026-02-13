import { ScoreType } from "./pong-game";

export default function PongScoreBoard({ scoreBoard }: { scoreBoard: ScoreType | null }) {
  if (!scoreBoard) return null;

  const left = scoreBoard.players[0];
  const right = scoreBoard.players[1];

  return (
    <div className="mt-6 flex justify-center">
      {/* Card principal */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl px-8 py-6 w-full max-w-[820px]">
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative flex flex-col gap-6">

          {/* Linha de jogadores */}
          <div className="flex items-center justify-between">

            {/* Player esquerda */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-30" />
              <div className="relative rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 flex items-center gap-3 min-w-[180px]">
                <img
                  src={`/public/uploads/avatar_${left.id}.png`}
                  alt="Player Avatar"
                  className="h-12 w-12 rounded-full border-2 border-white/20 shadow object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/default_avatar.png';
                  }}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-white truncate">
                    {left.name || 'Player'}
                  </p>
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    //PLAYER 1
                  </span>
                </div>
              </div>
            </div>

            {/* Timer central */}
            <div className="flex flex-col items-center gap-2">
              <div className="px-6 py-2 rounded-lg bg-white/10 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.5)] text-white font-bold text-lg backdrop-blur-sm text-center min-w-[90px]">
                {scoreBoard.timer ?? '00:00'}
              </div>
            </div>

            {/* Player direita */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur-lg opacity-30" />
              <div className="relative rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 flex items-center gap-3 min-w-[180px] justify-end">
                <div className="flex flex-col items-end">
                  <p className="text-sm font-bold text-white truncate">
                    {right.name || 'Player'}
                  </p>
                  <span className="text-xs uppercase tracking-widest text-slate-400">
                    PLAYER 2
                  </span>
                </div>
                <img
                  src={`/public/uploads/avatar_${right.id}.png`}
                  alt="Player Avatar"
                  className="h-12 w-12 rounded-full border-2 border-white/20 shadow object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/default_avatar.png';
                  }}
                />
              </div>
            </div>

          </div>

          {/* Linha de scores */}
          <div className="flex items-center justify-between px-8">
            <span className="text-4xl font-black text-green-400 drop-shadow">
              {left.score}
            </span>

            <span className="text-4xl font-black text-green-400 drop-shadow">
              {right.score}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
