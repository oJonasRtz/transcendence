import "./style.css"
import { connectPlayer } from './connection/connect';
import { Pong } from './game/pong';
import { identity, state } from './globals';
import * as ex from 'excalibur';

connectPlayer();

function waitGameStart(): Promise<void> {
	return new Promise((resolve) => {
		const check = () => {
			if (state.gameStarted) {
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

// //This will be called in front-end | erase this line after
(async() => {
	const playerId = Number(prompt("Enter your player ID:"));
	const matchId = Number(prompt("Enter your match ID:"));
	const name = prompt("Enter your name:") || "Player";

	await startGame(playerId, matchId, name);
})();

// const engine = new ex.Engine({
// 	width: 800,
// 	height: 600,
// 	backgroundColor: ex.Color.White
// });

// const paddle = new ex.Actor({
// 	width: 20,
// 	height: 100,
// 	x: 50,
// 	y: engine.drawHeight / 2,
// 	color: ex.Color.Blue
// });

// engine.add(paddle);

// engine.start();