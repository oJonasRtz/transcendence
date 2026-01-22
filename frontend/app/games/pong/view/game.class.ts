import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { gameState, stats } from '../globals';
import { Ball } from './actors/ball';
import { ScoreBoard } from './ScoreBoard.class';
import { hideDisconnectScreen, showDisconnectScreen } from '../main';

export class Game {
	private engine: ex.Engine;
	private paddles: ex.Actor[] | null = null;
	private ball: ex.Actor | null = null;

	private endPromisse !: Promise<void>;
	private endResolve !: () => void;
	private ended: boolean = false;

	constructor(container: HTMLElement) {
		const canvas = document.createElement('canvas');
		canvas.id = 'pong';
		
		container.innerHTML = '';
		container.appendChild(canvas);

		this.engine = new ex.Engine({
			canvasElement: canvas,
			width: stats?.game?.width ?? 800,
			height: stats?.game?.height ?? 600,
			backgroundColor: new ex.Color(10, 20, 45, 1),
			displayMode: ex.DisplayMode.FitScreen,
		});

		const score = new ScoreBoard(this.engine);

		this.addToGame([score]);
		this.addPaddles();

		this.engine.on('preupdate', () => {
			const {gameEnd} = gameState.getGame();

			if (gameEnd)
				this.end();

			const players = gameState.getPlayers();
			if (!players[1].connected || !players[2].connected)
				showDisconnectScreen();
			else
				hideDisconnectScreen();

			this.ballReset();
		});

		window.addEventListener('keydown', (e) => {
			if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
				e.preventDefault();
			}
		});
	}

	private ballReset() {
		const {exist} = gameState.getBall();
		
		if (!exist) {
			if (this.ball) {
				this.engine.remove(this.ball);
				this.ball = null;
				// console.log("Ball removed from the game");
			}
			return;
		}

		if (!this.ball) {
			this.ball = new Ball(this.engine.drawWidth / 2, this.engine.drawHeight / 2);
			this.addToGame([this.ball]);
			// console.log("Ball added to the game");
		}
	}
	private addPaddles() {
		this.paddles = [
			new Paddle(50, this.engine.drawHeight / 2, 1),
			new Paddle(this.engine.drawWidth - 50, this.engine.drawHeight / 2, 2),
		];


		this.addToGame(this.paddles);
	}

	private addToGame(data: ex.Actor[]) {
		data.forEach((actor) => {
			this.engine.add(actor);
		});
	}

	async start(): Promise<void> {

		if (!this.endPromisse) {
			this.endPromisse = new Promise<void>((resolve) => {
				this.endResolve = resolve;
			})
		}

		await this.engine.start();

		return this.endPromisse;
	}

	end() {
		if (this.ended) return;

		this.ended = true;
		this.engine.stop();
		if (this.endResolve)
			this.endResolve();
	}
}
