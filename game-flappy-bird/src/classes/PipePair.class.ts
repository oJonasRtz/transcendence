import * as ex from 'excalibur';
import { Pipe } from './Pipe.class';

export class PipePair extends ex.Actor {
	private pipes: Pipe[] = [];
	private scored: boolean = false;
	private playerPosX: number = 0; ;

	constructor(drawHeight: number, drawWidth:number, playerX:number, addToGame: (data: ex.Actor[]) => void) {
		super({});

		this.playerPosX = playerX;
		this.pipes = this.getPipePos(50, drawHeight, drawWidth);

		addToGame(this.pipes);
		this.pipes.forEach(pipe => {
			pipe.on('scored', () => {
				if (!this.scored) {
					this.scored = true;
					this.emit('scored');
				}
			});
			pipe.on('kill', () => this.emit('kill'));
		});
	}

	private getPipePos(width: number, drawHeight: number, drawWidth: number): Pipe[] {
		const gap: number = 50;
		const screenH: number = drawHeight;
		const pipeX: number = drawWidth + 50; //Spawn off screen
		const map = {
			top: [
				{ x: pipeX, y: 0, width: width, height: 100 },
				{ x: pipeX, y: 100 + gap, width: width, height: screenH - (100 + gap) },
			],
			mid: [
				{ x: pipeX, y: 0, width: width, height: 210 },
				{ x: pipeX, y: 210 + gap, width: width, height: screenH - (210 + gap) },
			],
			bot: [
				{ x: pipeX, y: 0, width: width, height: 320 },
				{ x: pipeX, y: 320 + gap, width: width, height: screenH - (320 + gap) },
			]
		};

		const keys = Object.keys(map);
		const choice = keys[Math.floor(Math.random() * keys.length)];

		const [top, bot] = map[choice as keyof typeof map];

		return [
			new Pipe(top.x, top.y, top.width, top.height, this.playerPosX),
			new Pipe(bot.x, bot.y, bot.width, bot.height, this.playerPosX),
		];
	}
}
