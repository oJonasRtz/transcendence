import * as ex from 'excalibur';
import { state } from '../../globals';
import { Paddle } from './paddle';
import { notifyBounce } from '../../connection/notify/notifyBounce';

export class Ball extends ex.Actor {
	constructor() {
		super({
			width: 20,
			height: 20,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Passive
		});
	}

	onInitialize(): void {
		this.pos.x = state.ballPos.vector.x;
		this.pos.y = state.ballPos.vector.y;

		this.on('collisionstart', (col) => {
			if (col.other.owner instanceof Paddle)
				notifyBounce('x');
		});
	}

	onPreUpdate(_engine: ex.Engine, _delta: number): void {
		if (!state.allOk || !state.ballPos.exist) return;
		
		this.pos.x = state.ballPos.vector.x;
		this.pos.y = state.ballPos.vector.y;
	}
}
