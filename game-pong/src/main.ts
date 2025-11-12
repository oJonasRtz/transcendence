import "./style.css"
import { connectPlayer } from './connection/connect';
import { Pong } from './game/pong';
import { gameState, identity } from './globals';

connectPlayer();

function waitGameStart(): Promise<void> {
	return new Promise((resolve) => {
		const check = () => {
			if (gameState.gameStarted) {
				resolve();
			} else {
				requestAnimationFrame(check);
			}
		}
		check();
	})
}

export async function startGame(playerId: number, matchId: number, name: string, gameMode: "online" | "single" = "online"): Promise<void> {
	identity.playerId = playerId;
	identity.matchId = matchId;
	identity.name = name;
	await waitGameStart();
	const pong = new Pong();
	pong.start();
};

//This will be called in front-end | erase this line after
(async() => {
	const playerId = Number(prompt("Enter your player ID:"));
	const matchId = Number(prompt("Enter your match ID:"));
	const name = prompt("Enter your name:") || "Player";

	await startGame(playerId, matchId, name);
})();
