import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { connection, gameState } from '../globals';
import { Ball } from './actors/ball';

export class Game {
	private engine: ex.Engine;
	private paddles: ex.Actor[] | null = null;
	private ball: ex.Actor | null = null;
	constructor() {
		this.engine = new ex.Engine({
			width: 800,
			height: 600,
			backgroundColor: ex.Color.Black,
			displayMode: ex.DisplayMode.FitScreen,
		});

		this.addPaddles();

		this.engine.on('preupdate', () => {
			this.ballReset();
		});
	}

	private ballReset() {
		const {exist} = gameState.getBall();
		const {gameEnd} = gameState.getGame();
		
		if (!exist) {
			if (this.ball) {
				this.engine.remove(this.ball);
				delete this.ball;
				this.ball = null;
				console.log("Ball removed from the game");
			}
			return;
		}

		if (!this.ball) {
			this.ball = new Ball(this.engine.drawWidth / 2, this.engine.drawHeight / 2, connection.notifyBounce);
			this.addToGame([this.ball]);
			console.log("Ball added to the game");
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

	start() {
		this.engine.start();
	}
}
