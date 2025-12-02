import * as ex from 'excalibur';

export class Birb extends ex.Actor{
	private jumpForce = 400;
	private keyBindings: ex.Keys[] = [
		ex.Keys.Space,
		ex.Keys.Up
	];

	constructor(x: number, y: number){
		super({
			x: x,
			y: y,
			width: 32,
			height: 32,
			color: ex.Color.Yellow
		});
		this.body.acc.y = 800; // Gravity
		this.body.collisionType = ex.CollisionType.Active;
	}

	private jump():void {
		this.body.vel.y = -this.jumpForce;
	}

	onInitialize(engine: ex.Engine): void {
		engine.input.keyboard.on('press', (evt) => {
			if (this.keyBindings.includes(evt.key))
				this.jump();
		});
		engine.input.pointers.primary.on('down', () => this.jump());

		this.on('collisionstart', (evt) => {
			const other: ex.Actor = evt.other.owner as ex.Actor;

			if (other.hasTag && other.hasTag('pipe')) {
				console.log('[Birb] Colidiu com um cano! Game Over!');
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
	}

}
