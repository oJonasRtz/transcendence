"use client";
import { match } from './MatchProvider';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@/app/lib/auth';
import { useEffect, useState } from 'react';
import WaitingLobbySkeleton from './waiting-lobby-skeleton';

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
  const [queueTime, setQueueTime] = useState(0);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [gameType, setGameType] = useState<GameType>('RANKED');
  const [queueActionError, setQueueActionError] = useState<string | null>(null);
  // const [showMatchFound, setShowMatchFound] = useState(false);
  const [isLeader, setIsLeader] = useState(true);
  const [animatedPlayers, setAnimatedPlayers] = useState<string[]>([])

  const params = useParams();

  // console.log('WaitingLobby token:', token);

  useEffect(() => {
    setInQueue(match.inQueue);
    match.onState = (nextState: string) => {
      setInQueue(nextState === 'IN_QUEUE');
    };

    return () => {
      match.onState = null;
    };
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (match.match_id && !showMatchFound){
  //       setShowMatchFound(true);
  //     }
  //   }, 500);

  //   return () => clearInterval(interval);
  // }, [showMatchFound]);

  // Connect and join party on mount
  useEffect(() => {
    let token: string | null = params.token as string || null;
  
    const joinLobby = async () => {
      try {
        if (!match.isConnected) {
          const fallbackName = match.matchInfo.name || user.username;
          match.connect({
            name: fallbackName,
            email: user.email,
            id: user.user_id,
          });
        }
  
        if (match.party.length > 0) {
          console.log('Already in a party, skipping join.');
          return;
        }
  
        await match.joinParty(gameType, token || null);
      } catch (err) {
        console.error('Failed to join lobby:', err);
      }
    };
  
    joinLobby();
  
    // Leave party on unmount
    return () => {};
  }, [user, gameType]);

  useEffect(() => {
    let redirected = false;
    const interval = setInterval(() => {
      if (redirected) return;
      if (!match.match_id) return;

      redirected = true;
      router.push('/dashboard/play/pong');
    }, 250);

    return () => clearInterval(interval);
  }, [router]);
  

  // Sync players from match.party periodically
  useEffect(() => {
    const updatePlayers = () => {
      const newPlayers = match.party.map((p) => ({
        public_id: p.id,
        username: p.name,
        nickname: p.name,
        avatar: `/public/uploads/avatar_${p.id}.png`,
        isOnline: true,
        isHost: p.isLeader,
      }));
    
      setPlayers(newPlayers);
    
      // Marca jogadores novos para animar
      setAnimatedPlayers((prev) => {
        const existingIds = prev;
        const newIds = newPlayers
          .map(p => p.public_id)
          .filter(id => !existingIds.includes(id));
        return [...existingIds, ...newIds];
      });
    
      setIsLeader(
        match.party.find((p) => p.id === user.user_id || p.id === user.public_id)?.isLeader || false
      );
      setInQueue(match.inQueue);
    };

    updatePlayers();
    const interval = setInterval(updatePlayers, 1000);

    return () => clearInterval(interval);
  }, []);

  // Queue timer
  useEffect(() => {
    if (!inQueue) {
      setQueueTime(0);
      return;
    }

    const interval = setInterval(() => setQueueTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [inQueue]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  const isLoadding = !match.isConnected || players.length === 0;
  if (isLoadding)
    return <WaitingLobbySkeleton/>

  return (
    <div className="space-y-6">
      {/* {!match.isConnected && <MatchProvider user={user} />} */}

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          Waiting Room
        </h1>
        <p className="text-lg font-mono uppercase tracking-widest text-purple-400">
          //{gameType}
        </p>

        {/* <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={() => !inQueue && setGameType('RANKED')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300
              ${gameType === 'RANKED' ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300'}
              ${inQueue ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            Ranked
          </button>
          <button
            onClick={() => !inQueue && setGameType('TOURNAMENT')}
            disabled={true}
            className={'px-6 py-3 rounded-xl font-bold transition-all text-white bg-purple-500 opacity-50 cursor-not-allowed'}
          >
            Tournament
          </button>
        </div> */}
      </div>

      {/* {showMatchFound && <MatchNotify title={'Match Found'} time={__TIME_TO_WAIT__.MAX_TIME} />} */}

      {/* Lobby Container */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-8">
        <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative flex flex-col items-center justify-center gap-8">
        
        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {players.map((player) => {
            const isAnimated = animatedPlayers.includes(player.public_id);

            return (
              <div
                key={player.public_id}
                className={`relative group transform transition-all duration-500 ease-out
                  ${isAnimated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
                `}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition duration-300" />
                <div className="relative rounded-xl border border-white/10 bg-slate-900/60 p-6 flex flex-col items-center gap-4 w-56">
                  <img
                    src={player.avatar || '/images/default_avatar.png'}
                    alt="Player Avatar"
                    className="h-24 w-24 rounded-full border-4 border-white/20 shadow-xl object-cover"
                  />
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${player.isHost ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                    {player.nickname || player.username || 'Player'}
                  </p>
                  <span className={`text-xs font-mono uppercase tracking-widest ${inQueue ? 'text-green-400' : 'text-slate-400'}`}>
                    {inQueue ? 'IN QUEUE' : 'WAITING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>


          {/* Queue Timer */}
          {inQueue && (
            <div className="mt-4 text-xl font-mono text-green-400 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
              ⏱ {formatTime(queueTime)}
            </div>
          )}

         {/* Action Buttons */}
        <div className="flex w-full max-w-md justify-center">
          <div className="relative w-full">
            {/* Enqueue Button */}
            <button
              onClick={() => {
                if (!isLeader || inQueue) return;
                const enqueued = match.enqueue(gameType);

                if (!enqueued) {
                  setQueueActionError('Matchmaking is not ready yet. Please wait 1 second and try again.');
                  return;
                }

                setQueueActionError(null);
                setInQueue(true);
              }}
              disabled={!isLeader || inQueue}
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center justify-center gap-4
                ${
                  inQueue
                    ? 'bg-green-500/20 text-green-300 border border-green-500/40 cursor-not-allowed'
                    : !isLeader
                      ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed'
                      : 'bg-green-500/30 hover:bg-green-500/40 text-green-300 border border-green-500/50 shadow-lg shadow-green-500/20'
                }`}
            >
              {inQueue ? 'In Queue' : isLeader ? 'Find Match' : 'Only leader can start'}
            </button>

            {/* Dequeue Button (X) */}
            {inQueue && (
              <button
                onClick={() => {
                  match.dequeue();
                  setQueueActionError(null);
                  setInQueue(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-red-500/30 hover:bg-red-500/50 border border-red-500/50 text-red-300 flex items-center justify-center font-black text-lg transition-all shadow-lg shadow-red-500/20"
                aria-label="Leave Queue"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {queueActionError && (
          <div className="w-full max-w-md rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{queueActionError}</p>
          </div>
        )}
      </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            match.leaveParty().catch(console.error);
            match.dequeue();
            router.push('/dashboard/play');
          }}
          className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white transition-all duration-300 flex items-center gap-2"
        >
          ← Back to Games
        </button>
      </div>

      {/* Players Info */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 mt-6">
        <h3 className="text-lg font-bold text-white mb-4">Players Info</h3>
        <ul className="space-y-2 text-slate-400 text-sm">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />
            <span>Room leader</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-400 inline-block" />
            <span>Room members</span>
          </li>
          <li className='flex items-center gap-2'>
            <span className="text-green-400">⏱</span>
            <span>Once you find a match you will be redirected to the game in some seconds</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
