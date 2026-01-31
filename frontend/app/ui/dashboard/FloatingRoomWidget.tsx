"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { match } from "./MatchProvider";

type PlayerProfile = {
  public_id: string;
  username: string;
  nickname?: string | null;
  avatar?: string | null;
  isHost?: boolean;
};

export default function FloatingRoomWidget() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);

  useEffect(() => {
    const updatePlayers = () => {
      setPlayers(
        match.party.map((p) => ({
          public_id: p.id,
          username: p.name,
          nickname: p.name,
          avatar: `/public/uploads/avatar_${p.id}.png`,
          isHost: p.isLeader,
        }))
      );
    };

    updatePlayers();
    match.onParty = updatePlayers;

    const interval = setInterval(updatePlayers, 1000);

    return () => {
      clearInterval(interval);
      match.onParty = null;
    };
  }, []);

  if (!players.length || !match.partyToken) return null;

  // Link da sala
  const roomLink = `${window.location.origin}/dashboard/play/waiting-lobby/${match.partyToken}`;

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomLink).then(() => {
      alert("Room link copied!");
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="h-14 w-14 rounded-full bg-black/70 backdrop-blur border border-white/10 shadow-xl flex items-center justify-center hover:bg-black/80 transition"
        >
          <span className="text-white text-xl">🎮</span>
        </button>
      )}

      {/* Expanded */}
      {!collapsed && (
        <div className="w-64 rounded-2xl bg-black/70 backdrop-blur border border-white/10 shadow-2xl p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            {/* Botão para copiar link da sala */}
            <button
              onClick={copyRoomLink}
              className="text-white/70 hover:text-white text-sm px-2 py-1 border border-white/20 rounded"
            >
              🔗 Copy Link
            </button>

            <p className="text-sm font-mono uppercase tracking-widest text-purple-400 flex-1 text-center">
              Current Room
            </p>

            <button
              onClick={() => setCollapsed(true)}
              className="text-white/60 hover:text-white text-lg"
            >
              ✕
            </button>
          </div>

          {/* Avatars */}
          <div className="flex -space-x-3 justify-center">
            {players.slice(0, 5).map((player) => (
              <img
                key={player.public_id}
                src={player.avatar || "/images/default_avatar.png"}
                alt={player.nickname || player.username || "Player"}
                className={`h-12 w-12 rounded-full border-2 shadow-lg object-cover ${
                  player.isHost ? "border-yellow-400" : "border-white/20"
                }`}
              />
            ))}
            {players.length > 5 && (
              <div className="h-12 w-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-xs text-white">
                +{players.length - 5}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() =>
                router.push(`/dashboard/play/waiting-lobby/${match.partyToken}`)
              }
              className="flex-1 py-2 rounded-lg bg-green-500/30 hover:bg-green-500/40 text-green-300 font-bold text-sm border border-green-500/50 transition"
            >
              Enter Room
            </button>
            {/* Novo botão "X" para sair da party */}
            <button
              onClick={() => {
                match.leaveParty();
                setCollapsed(true);
              }}
              className="py-2 px-3 rounded-lg bg-red-500/30 hover:bg-red-500/40 text-red-300 font-bold text-sm border border-red-500/50 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
