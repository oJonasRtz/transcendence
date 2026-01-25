import * as ex from 'excalibur';

export class Pipe extends ex.Actor {
	private playerPos: number = 0;
	private scored: boolean = false;
	private sprite: ex.ImageSource | null = null;
	private isTop: boolean = false;

	constructor(x: number, y: number, width: number, height: number, playerX: number, isTop: boolean, sprite: ex.ImageSource | null = null) {
		super({
			x: x,
			y: y,
			width: width,
			height: height,
			color: ex.Color.Green
		});

		this.pos.y += height / 2; // Adjust position to top-center origin
		this.sprite = sprite;
		this.addTag('pipe');
		this.playerPos = playerX;

		this.body.collisionType = ex.CollisionType.Fixed;

		this.collider.set(ex.Shape.Box(this.width, this.height));
		this.body.vel.x = -200; // Move left
		this.isTop = isTop;
	}

	onInitialize(engine: ex.Engine): void {
		if (!this.sprite) return;

		const sprite = new ex.Sprite({
			image: this.sprite,
			sourceView: new ex.Rectangle(0, 0, this.sprite.width, this.sprite.height),
			destSize: {
				width: this.width,
				height: this.height
			}
		});

		sprite.flipVertical = this.isTop;

		this.graphics.use(sprite);
	}

	onPreUpdate(): void {
		if (this.pos.x + this.width / 2 < 0) {
			this.kill();
		}

		if (!this.scored && this.pos.x < this.playerPos) {
			console.log('[Pipe] Pontuou!');
			this.scored = true;
			this.emit('scored');
		}
	}
}
