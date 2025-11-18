import * as ex from 'excalibur';
import { Paddle } from './paddle';
import { gameState } from '../../globals';

export class Ball extends ex.Actor {
	private onBounce: (axis: 'x' | 'y') => void;

	constructor(x: number, y: number, onBounce: (axis: 'x' | 'y') => void) {
		super({
			width: 20,
			height: 20,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Passive,
			pos: new ex.Vector(x, y),
		});

		this.onBounce = onBounce;
	}

	onInitialize(): void {
		this.on('collisionstart', (col) => {
			if (col.other.owner instanceof  Paddle)
				this.onBounce('x');
		});
	}

	onPreUpdate(_engine: ex.Engine, _delta: number): void {
		const {vector} = gameState.getBall();
		this.pos.x = vector.x;
		this.pos.y = vector.y;
	}
}
