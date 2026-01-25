import { Game } from "./classes/Game.class";

// const game = new Game();

// game.start();

/**
 * Starts the Flappy Bird game and waits till its end.
 * @returns A promise that resolves to the final score achieved in the game.
*/
export async function	startFlappyBird(setScore: (score: number) => void, saveHighScore: (score: number) => void): Promise<Game>{
	const container = document.getElementById('flappy');
	if (!container)
		throw new Error("Flappy Bird container not found");

	const	game = new Game(container, setScore, saveHighScore);
	await game.start();

	return game;
}
