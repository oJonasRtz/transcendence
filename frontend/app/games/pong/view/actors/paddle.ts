import * as ex from 'excalibur';
import { gameState, stats } from '../../globals';

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
	private spriteRef: ex.Sprite | null = null;
	private baseSize = {width: 20, height: 100};
	private readonly mapHeight = stats?.map?.height ?? 600;
	private readonly borderMargin = stats?.margin ?? 10;
	private readonly baseSpeedPxPerSec = stats?.paddle?.speed ?? 600;

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
		this.baseSize = {width: p.size.width, height: p.size.height};
	}

	onInitialize(): void {
		const spr = this.sprite!.toSprite();

		spr.flipHorizontal = this.number === 2;
		this.spriteRef = spr;

		this.graphics.add(spr);
	}
	
	onPreUpdate(_engine: ex.Engine, _delta: number): void {
		const players = gameState.getPlayers();
		const p = players[this.number];
		const effects = gameState.getEffectsForPlayer(this.number);
		const localSlot = gameState.getIdentity().id;

		if (!p) return;

		this.pos.x = p.pos.x;
		if (localSlot === this.number) {
			let speedMultiplier = 1;
			for (const effect of effects) {
				if (effect.type === "QUICK_FEET") speedMultiplier = 1.35;
				if (effect.type === "FROZEN_RIVAL") speedMultiplier = 0.68;
			}
			const predictedY = gameState.getReconciledLocalY(
				this.number,
				p.pos.y,
				this.baseSpeedPxPerSec,
				speedMultiplier
			);
			const halfHeight = p.size.height / 2;
			const minY = this.borderMargin + halfHeight;
			const maxY = this.mapHeight - this.borderMargin - halfHeight;
			const clampedY = Math.max(minY, Math.min(maxY, predictedY));
			this.pos.y += (clampedY - this.pos.y) * 0.4;
		} else {
			this.pos.y += (p.pos.y - this.pos.y) * 0.5;
		}

		const widthScale = p.size.width / this.baseSize.width;
		const heightScale = p.size.height / this.baseSize.height;
		const pulse = effects.length
			? 1 + Math.sin(performance.now() / 120) * 0.035
			: 1;
		this.scale = new ex.Vector(widthScale * pulse, heightScale * pulse);

		if (!this.spriteRef) return;
		if (!effects.length) {
			this.spriteRef.tint = ex.Color.White;
			return;
		}

		try {
			this.spriteRef.tint = ex.Color.fromHex(effects[0].color);
		} catch (_error) {
			this.spriteRef.tint = this.colour[this.number];
		}
	}

}
