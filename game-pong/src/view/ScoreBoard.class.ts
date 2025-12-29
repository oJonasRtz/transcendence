import * as ex from 'excalibur';
import { gameState } from '../globals';

type Side = 'left' | 'right';
type ScoreSide = {
	name: ex.Label;
	score: ex.Label;
}

export class ScoreBoard extends ex.ScreenElement {
	private scores: Record<Side, ScoreSide>;
	private timer: ex.Label;
	private engine!: ex.Engine;

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

			this.addChild(name);
			this.addChild(score);
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
		// this.scores.left.name.text = players[1].name || 'Player 1';
		// this.scores.right.name.text = players[2].name || 'Player 2';
		
		// this.scores.left.score.text = String(players[1].score);
		// this.scores.right.score.text = String(players[2].score);

		this.timer.text = game.timer;
	}
}
