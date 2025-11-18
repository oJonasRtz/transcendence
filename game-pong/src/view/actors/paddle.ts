import * as ex from 'excalibur';
import { gameState } from '../../globals';

export class Paddle extends ex.Actor {
	private number: 1 | 2 = 1;

	constructor(x: number, y: number, player: 1 | 2 = 1) {
		const players = gameState.getPlayers();
		const p = players[player];
		super({
			x: x,
			y: y,
			width: p.size.width,
			height: p.size.height,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Fixed
		});

		this.number = player;
	}

	onPreUpdate(): void {
		const players = gameState.getPlayers();
		const p = players[this.number];

		if (!p) return;

		this.pos.y = p.pos.y;
		this.pos.x = p.pos.x;
	}

}
