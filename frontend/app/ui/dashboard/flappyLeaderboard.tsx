import Link from "next/link";
import { CardHeader, CardShell, EmptyState } from "./card-primitives";
import Image from "next/image";
import { FlappyUser } from "@/app/lib/dashboard-data";

interface FlappyLeaderboardProps {
	leaderboard: FlappyUser[];
	currentUserId?: string; // <-- ID do usuário logado
  }
  
  export default function FlappyLeaderboard({ leaderboard, currentUserId }: FlappyLeaderboardProps) {
	const truncateName = (name: string) => name?.length > 10 ? name.slice(0,10) + '…' : (name || 'Unknown');
  
	// Descobrir o rank do usuário logado
	const currentUserRank = currentUserId
	  ? leaderboard.findIndex(u => u.user_id === currentUserId) + 1
	  : undefined;
  
	return (
	  <CardShell
		className="w-full lg:w-1/3 lg:ml-0 flex-shrink-0"
	  >
		<CardHeader
		  title="Flappy Bird Leaderboard"
		  accentClassName="text-yellow-400"
		  subtitle={currentUserRank ? `Your Rank: #${currentUserRank}` : undefined}
		/>
  
		<div className="divide-y divide-white/5">
		  {leaderboard.length === 0 ? (
			<EmptyState title="No scores yet" message="Play Flappy Bird to get on the leaderboard." />
		  ) : (
			leaderboard.map((entry, index) => (
			  <div
				key={entry.user_id}
				className={`flex items-center space-x-4 p-4 transition-all duration-300 hover:bg-white/5 ${
				  entry.user_id === currentUserId ? 'bg-white/10' : ''
				}`}
			  >
				<span className={`w-8 text-lg font-black ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-500' : 'text-slate-500'}`}>
				  #{index + 1}
				</span>
  
				<Link href={`/profile/${entry.public_id}`} className="flex items-center gap-4 flex-1">
				  <div className="relative rounded-full rounded-2xl p-[2px] border border-blue-600 shadow-2xl group-hover:border-purple-500 transition-colors">
					<Image
						src={entry.avatar}
						alt={entry.username}
						width={40}
						height={40}
						className="rounded-full border-2 border-white/10" />
					{entry.isOnline && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-400 animate-pulse"></span>}
				  </div>
				  <div className="flex-1">
					<p className="font-semibold text-white">{truncateName(entry.username)}</p>
				  </div>
				</Link>
  
				<div className="text-right flex flex-col justify-end">
				  <p className="font-black text-yellow-400 text-lg">{entry.high_score}</p>
				</div>
			  </div>
			))
		  )}
		</div>
	  </CardShell>
	);
  }
  