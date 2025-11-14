import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';

export class Game {
	private engine: ex.Engine;
	private paddles: ex.Actor[]; 
	constructor() {
		this.engine = new ex.Engine({
			width: 800,
			height: 600,
			backgroundColor: ex.Color.Black,
			displayMode: ex.DisplayMode.Fixed
		});

		this.paddles = [];
		for (let i = 1; i <= 2; i++) {
			const x = i === 1 ? 50 : this.engine.drawWidth - 50;
			this.paddles[i] = new Paddle(x, this.engine.drawHeight / 2, i, 10);
		}
		this.paddles.forEach((paddle) => {
			this.engine.add(paddle);
		});
	}



	start() {
		this.engine.start();
	}
}
