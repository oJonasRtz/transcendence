import * as ex from 'excalibur';
import { gameState } from '../globals';

type Side = 'left' | 'right';
type ScoreSide = {
	name: ex.Label;
	score: ex.Label;
}
type PingType = {
	dot: ex.Actor | null;
	label: ex.Label | null;
}


export class ScoreBoard extends ex.ScreenElement {
	private scores: Record<Side, ScoreSide>;
	private timer: ex.Label;
	private engine!: ex.Engine;
	private ping: PingType = {
		dot: null,
		label: null,
	};

	constructor(engine: ex.Engine) {
		super({z: 1000});

		const center = engine.drawWidth / 2;
		const y = 30;
		const font = 'monospace';
		const colour = ex.Color.LightGray;

		const sides: Side[] = ['left', 'right'];
		this.scores = {} as Record<Side, ScoreSide>;

		for(const side of sides) {
			const isLeft = side === 'left';
			const dir = isLeft ? -1 : 1;

			this.engine = engine;
			const nameAlign = isLeft ? ex.TextAlign.Right : ex.TextAlign.Left;

			const name = new ex.Label({
				text: isLeft ? 'Player 1' : 'Player 2',
				pos: new ex.Vector(center + dir * 140, y),
				font: new ex.Font({
					family: font,
					size: 18,
					color: colour,
					textAlign: nameAlign,
				}),
			});

			const score = new ex.Label({
				text: '0',
				pos: new ex.Vector(center + dir * 50, y),
				font: new ex.Font({
					family: font,
					size: 32,
					color: colour,
					textAlign: ex.TextAlign.Center,
				}),
			});

			this.scores[side as Side] = { name, score };

			//Ping
			const pingX = engine.drawWidth - 20;
			const pingY = 20;

			this.ping.dot = new ex.Actor({
				pos: new ex.Vector(pingX - 50, pingY),
				width: 8,
				height: 8,
				color: ex.Color.Green,
			});
			this.ping.dot.graphics.use(
				new ex.Circle({
					radius: 4,
					color: ex.Color.Green,
				})
			);
			this.ping.label = new ex.Label({
				text: '0 ms',
				pos: new ex.Vector(pingX, pingY - 4),
				font: new ex.Font({
					family: font,
					size: 14,
					color: colour,
					textAlign: ex.TextAlign.Right,
				}),
			});
			

			this.addChild(name);
			this.addChild(score);
			this.addChild(this.ping.dot);
			this.addChild(this.ping.label);
		}

		this.timer = new ex.Label({
			text: '00:00',
			pos: new ex.Vector(center, y + 40),
			font: new ex.Font({
				family: font,
				size: 16,
				color: colour,
				textAlign: ex.TextAlign.Center,
			}),
		});

		this.addChild(this.timer);
	}

	onPreDraw(ctx: any): void {
		const radius = 3;
		const colour = new ex.Color(255, 255, 255, 0.25);
		const step = 16;

		const safeBot = 90;

		ctx.save();

		for (let y = safeBot; y < this.engine.drawHeight; y += step) {
			ctx.drawCircle(
				ex.vec(this.engine.drawWidth / 2, y),
				radius,
				colour
			);
		}

		ctx.restore();
	}

	onPreUpdate(): void {
		const players = gameState.getPlayers();
		const game = gameState.getGame();

		([1, 2] as const).forEach((i) => {
			const side: Side = i === 1 ? 'left' : 'right';

			this.scores[side].name.text = players[i].name || `Player ${i}`;
			this.scores[side].score.text = String(players[i].score);
		})

		this.timer.text = game.timer;
		
		const myPing = gameState.getPing();
		this.ping.label!.text = `${myPing} ms`;

		this.ping.dot!.color = ex.Color.Green;

		if (myPing > 400)
			this.ping.dot!.color = ex.Color.Red;
		else if (myPing > 150)
			this.ping.dot!.color = ex.Color.Yellow;

	}
}
