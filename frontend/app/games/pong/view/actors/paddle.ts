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
	private sprite?: ex.ImageSource;

	constructor(x: number, y: number, player: 1 | 2 = 1, sprite?: ex.ImageSource) {
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
		this.sprite = sprite;
	}

	onInitialize(): void {
		const spr = this.sprite!.toSprite();

		spr.flipHorizontal = this.number === 2;

		this.graphics.add(spr);
	}
	
	onPreUpdate(): void {
		const players = gameState.getPlayers();
		const p = players[this.number];

		if (!p) return;

		this.pos.y = p.pos.y;
		this.pos.x = p.pos.x;
	}

}
