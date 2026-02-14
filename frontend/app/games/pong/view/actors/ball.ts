import * as ex from 'excalibur';
import { gameState, stats } from '../../globals';

export class Ball extends ex.Actor {

	constructor(x: number, y: number) {
		super({
			width: stats?.game?.ball?.size ?? 20,
			height: stats?.game?.ball?.size ?? 20,
			collisionType: ex.CollisionType.Passive,
			pos: new ex.Vector(x, y),
		});
	}

	onInitialize(): void {
		const color = ex.Color.White;
		const body = new ex.Circle({
			radius: this.width / 2,
			color: color,
		});

		this.graphics.add(body);
	}

	onPreUpdate(_engine: ex.Engine, _delta: number): void {
		const {vector, exist} = gameState.getBall();
		if (!exist) return;

		this.pos.x = vector.x;
		this.pos.y = vector.y;
	}
}
