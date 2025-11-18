import * as ex from 'excalibur';
import { Paddle } from './paddle';
import { gameState } from '../../globals';

export class Ball extends ex.Actor {
	constructor(x: number, y: number) {
		super({
			width: 20,
			height: 20,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Passive,
			pos: new ex.Vector(x, y),
		});
	}

	onInitialize(): void {
		// this.pos.x = state.ballPos.vector.x;
		// this.pos.y = state.ballPos.vector.y;


		// this.on('collisionstart', (col) => {
		// 	if (col.other.owner instanceof  Paddle)
		// 		notifyBounce('x');
		// });
	}

	onPreUpdate(_engine: ex.Engine, _delta: number): void {
		// if (!state.allOk || !state.ballPos.exist) return;
		
		// this.pos.x = state.ballPos.vector.x;
		// this.pos.y = state.ballPos.vector.y;
		const {vector} = gameState.getBall();
		this.pos.x = vector.x;
		this.pos.y = vector.y;
		// console.log(`Ball position updated to x: ${this.pos.x}, y: ${this.pos.y}`);
	}
}
