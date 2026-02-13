import * as ex from 'excalibur';
import { GAME_HEIGHT } from '../globals';

export class Birb extends ex.Actor{
	private BASE_JUMP_FORCE: number = 400;
	private BASE_GRAVITY: number = 800;
	private SCALE: number = 1;
	private jumpForce: number = this.BASE_JUMP_FORCE;
	private keyBindings: ex.Keys[] = [
		ex.Keys.Space,
		ex.Keys.Up
	];
	private sprite: ex.ImageSource | null = null;

	constructor(x: number, y: number, drawHeight: number, sprite: ex.ImageSource) {
		super({
			x: x,
			y: y,
			width: 32,
			height: 32,
			// color: ex.Color.Yellow
		});

		this.sprite = sprite;
		this.SCALE = drawHeight / GAME_HEIGHT;

		this.jumpForce *= this.SCALE;
		if (this.jumpForce > this.BASE_JUMP_FORCE)
			this.jumpForce = this.BASE_JUMP_FORCE;
		this.body.acc.y = this.BASE_GRAVITY * this.SCALE; // Gravity
		if (this.body.acc.y > this.BASE_GRAVITY)
			this.body.acc.y = this.BASE_GRAVITY;

		this.body.collisionType = ex.CollisionType.Active;
	}

	private jump():void {
		this.body.vel.y = -this.jumpForce;
	}

	onInitialize(engine: ex.Engine): void {
		const sprite = this.sprite?.toSprite();
		sprite!.scale = ex.vec(this.SCALE, this.SCALE);
		this.graphics.use(sprite!);

		engine.input.keyboard.on('press', (evt) => {
			if (this.keyBindings.includes(evt.key))
				this.jump();
		});
		engine.input.pointers.primary.on('down', () => this.jump());

		this.on('collisionstart', (evt) => {
			const other: ex.Actor = evt.other.owner as ex.Actor;

			if (other.hasTag && other.hasTag('pipe')) {
				this.emit('kill');
			}
		});
	}

	onPostUpdate(engine: ex.Engine): void {
		const halfH = this.height / 2;
		const checkPosY = [
			{ condition: this.pos.y - halfH < 0, handler: () => {
				this.pos.y = halfH;
				this.body.vel.y = 0;
			}},
			{ condition: this.pos.y + halfH > engine.drawHeight, handler: () => this.kill() },
			{ condition: this.pos.x < 0, handler: () => this.kill() }
		];


		checkPosY.forEach(check => {
			if (check.condition)
				check.handler();
		});

		// === Rotate bird based on velocity ===
		const maxDownAngle = Math.PI; // 180 degrees
		const maxUpAndle = -Math.PI / 4; // -45 degrees
		const velFactor = 0.003; // sensivity
		let angle = this.body.vel.y * velFactor;
		
		//rotation limits
		if (angle > maxDownAngle) angle = maxDownAngle;
		if (angle < maxUpAndle) angle = maxUpAndle;

		this.rotation = angle;
	}

}
