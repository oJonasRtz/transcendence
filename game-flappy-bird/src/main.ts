import { Game } from "./classes/Game.class";

const game = new Game();

game.start();

/**
 * Starts the Flappy Bird game and waits till its end.
 * @returns A promise that resolves to the final score achieved in the game.
*/
// export async function	startFlappyBird(): Promise<number> {

// 	const	game = new Game();
// 	const	score: number = await game.start();

// 	return score;
// }
