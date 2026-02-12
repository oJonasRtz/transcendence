"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Run the Flappy Bird game on the client side.
 * @param restartSignal A signal to restart the game.
*/
export default function FlappyBird({
	restartSignal,
	setScore,
	saveHighScore}:{
		restartSignal: number,
		setScore: (score: number) => void,
		saveHighScore: (score: number) => Promise<void>

}) {
	const gameRef = useRef<any>(null);
	const [start, setStart] = useState(false);

	useEffect(() => {
		let mounted = true;

		if (!start) return;

		const init = async () => {
			const {startFlappyBird} = await import('./flappy-bird/main');
			
			if (!mounted) return;
			gameRef.current = await startFlappyBird(setScore, saveHighScore);
		};

		init();

		return () => {
			mounted = false;
			gameRef.current?.stop?.();
			gameRef.current = null;
		}
	}, [restartSignal, start]);

	return (
		<div className="relative w-full h-full">
			<div
				id="flappy"
				className="w-full h-full"
			/>
			{!start && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<button
					onClick={() => setStart(true)}
					className="px-8 py-4 rounded-xl
						bg-green-500/20 hover:bg-green-500/30
						border border-green-500/50 hover:border-green-500/70
						text-green-400 hover:text-green-300
						text-lg font-semibold
						transition-all duration-300"
					>
						Start
					</button>
				</div>
			)}
		</div>
	);
}
