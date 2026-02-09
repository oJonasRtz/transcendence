
interface CardProps {
	name: string;
	id: string;
	score: number;
	// playerNum: 1 | 2;
}

export default function PlayerCard({name, id, score}: CardProps) {

	const avatar: string = '/public/uploads/avatar_' + id + '.png';

	return (
		<div className="relative flex items-center gap-4 px-5 py-3 rounded-xl 
                    bg-white/5 border border-purple-400/20 backdrop-blur text-white 
                    min-w-[180px] shadow-[0_0_30px_rgba(168,85,247,0.25)]">
			<div className="absolute inset-0 rounded-xl bg-purple-500/10 blur-xl pointer-events-none" />
			<img
				src={avatar}
				alt={name}
				className="relative w-12 h-12 rounded-full object-cover 
						border border-purple-400/30 
						shadow-[0_0_18px_rgba(168,85,247,0.5)]"
			/>
			<div className="relative flex flex-col">
				<span className="text-sm text-slate-400">{name}</span>
				<span className="text-2xl font-bold">{score}</span>
			</div>
		</div>
	);
}
