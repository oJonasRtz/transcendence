import * as ex from 'excalibur';
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

	onPreUpdate(_engine: ex.Engine, _delta: number): void {
		const {vector} = gameState.getBall();
		this.pos.x = vector.x;
		this.pos.y = vector.y;
	}
}
