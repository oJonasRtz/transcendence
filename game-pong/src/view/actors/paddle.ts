import * as ex from 'excalibur';
import { gameState } from '../../globals';

type Colour = {
	1: ex.Color;
	2: ex.Color;
}

export class Paddle extends ex.Actor {
	private number: 1 | 2 = 1;
	private colour: Colour = {
		1: ex.Color.Blue,
		2: ex.Color.Red
	};

	constructor(x: number, y: number, player: 1 | 2 = 1) {
		const players = gameState.getPlayers();
		const p = players[player];
		super({
			x: x,
			y: y,
			width: p.size.width,
			height: p.size.height,
			collisionType: ex.CollisionType.Fixed
		});

		this.number = player;
	}

	onInitialize(): void {
		const colour = this.colour[this.number];

		const body = new ex.Rectangle({
			width: this.width,
			height: this.height,
			color: colour,
		});

		this.graphics.add(body);
	}
	
	onPreUpdate(): void {
		const players = gameState.getPlayers();
		const p = players[this.number];

		if (!p) return;

		this.pos.y = p.pos.y;
		this.pos.x = p.pos.x;
	}

}
