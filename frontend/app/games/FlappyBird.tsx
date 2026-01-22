"use client";

import { useEffect, useRef } from "react";

/**
 * Run the Flappy Bird game on the client side.
 * @param restartSignal A signal to restart the game.
*/
export default function FlappyBird({restartSignal}: {restartSignal: number}) {
	const gameRef = useRef<any>(null);

	useEffect(() => {
		let mounted = true;

		const init = async () => {
			const {startFlappyBird} = await import('./flappy-bird/main');
			
			if (!mounted) return;
			gameRef.current = await startFlappyBird();
		};

		init();

		return () => {
			mounted = false;
			gameRef.current?.stop?.();
			gameRef.current = null;
		}
	}, [restartSignal]);

	return (
		<div
			id="flappy"
			className="w-full h-full aspect-video rounded-lg"
			style={{ minHeight: 600 }} 
		/>
	);
}
