import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { gameState } from '../globals';
import { Ball } from './actors/ball';

export class Game {
	private engine: ex.Engine;
	private paddles: ex.Actor[];
	private ball: ex.Actor;
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

	public checkVerticalCollision(newPos: number, actorHeight: number): boolean {
		const MARGIN: number = 10;
		const roomHeight = this.engine.drawHeight;

		const bottom: boolean = newPos > ((roomHeight - actorHeight / 2) - MARGIN);
		const top: boolean = newPos < (actorHeight / 2) + MARGIN;

		return bottom || top;
	}

	private ballReset() {
		const {exist} = gameState.getBall();
		const {gameEnd} = gameState.getGame();
		if (exist && !gameEnd && this.ball) return;

		if (this.ball) {
			this.engine.remove(this.ball);
			delete this.ball;
		}

		this.ball = new Ball(this.engine.drawWidth / 2, this.engine.drawHeight / 2);
		this.addToGame([this.ball]);
		console.log("Ball reset at center");
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
