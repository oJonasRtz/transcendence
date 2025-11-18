import * as ex from 'excalibur';
import { gameState } from '../../globals';
import { checkVerticalCollision } from '../utils/checkCollision';
// import { checkVerticalCollision } from '../utils/checkCollision';
// import { state } from '../../globals';

export class Paddle extends ex.Actor {
	speed: number;
	number: 1 | 2;
	upMargin: number;

	constructor(x: number, y: number, player: 1 | 2 = 1, upMargin: number = 0) {
		super({
			x: x,
			y: y,
			width: 20,
			height: 100,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Fixed
		});
		this.upMargin = upMargin;
		this.speed = 1;
		this.number = player;
		console.log(`Paddle ${this.number} created`);
	}

	onPreUpdate(engine: ex.Engine, elapsed: number): void {
		const moveSpeed: number = this.getMoveSpeed(elapsed);

		if (checkVerticalCollision(this.pos.y + moveSpeed, this.height, engine.drawHeight, this.upMargin))
			return;

		this.pos.y += moveSpeed;
	}

	getMoveSpeed(delta: number): number {
		const input = gameState.getPlayers()[this.number].direction;

		const dir = Number(input.down) - Number(input.up);
		return((dir * this.speed) * delta) * Number(gameState.getGame().allOk);
	}
}
