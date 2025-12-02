import * as ex from 'excalibur';

export class Pipe extends ex.Actor {
	constructor(x: number, y: number, width: number, height: number) {
		super({
			x: x,
			y: y,
			width: width,
			height: height,
			color: ex.Color.Green
		});

		this.body.collisionType = ex.CollisionType.Fixed;

		this.collider.set(ex.Shape.Box(this.width, this.height));
		this.body.vel.x = -200; // Move left
	}

	onPreUpdate(engine: ex.Engine, elapsed: number): void {
		if (this.pos.x + this.width / 2 < 0) {
			this.kill();
		}
	}
}
