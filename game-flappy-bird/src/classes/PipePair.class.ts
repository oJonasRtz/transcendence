import * as ex from 'excalibur';
import { Pipe } from './Pipe.class';

export class PipePair extends ex.Actor {
	private pipes: Pipe[] = [];
	private scored: boolean = false;
	private playerPosX: number = 0; ;

	constructor(drawHeight: number, drawWidth:number, playerX:number, addToGame: (data: ex.Actor[]) => void) {
		super({});

		this.playerPosX = playerX;
		this.pipes = this.getPipePos(75, drawHeight, drawWidth);

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

	// private choose<T>(arr: T[]): T{
	// 	const index = Math.floor(Math.random() * arr.length);
	// 	return arr[index];
	// }

	private getPipePos(width: number, drawHeight: number, drawWidth: number): Pipe[] {
		const gap: number = 130;
		const screenH: number = drawHeight;
		const pipeX: number = drawWidth + 50; //Spawn off screen
		const height: number = screenH - gap;
		const map = {
			top: {
				up: { x: pipeX, y: 0, width, height: height - 25 },
				down: { x: pipeX, y: (height - 25) + gap, width, height: height - (height - 25 + gap) },
			},
			mid: {
				up: { x: pipeX, y: 0, width: width, height: 210 },
				down: { x: pipeX, y: 210 + gap, width: width, height: screenH - (210 + gap) },
			},
			bot: {
				up: { x: pipeX, y: 0, width: width, height: 320 },
				down: { x: pipeX, y: 320 + gap, width: width, height: screenH - (320 + gap) },
			}
		};

		// const keys = Object.keys(map);
		// const i = this.choose(keys);
		// const choice = map[i as keyof typeof map];

		const choice = map.top;

		return [
			new Pipe(choice.up.x, choice.up.y, choice.up.width, choice.up.height, this.playerPosX),
			new Pipe(choice.down.x, choice.down.y, choice.down.width, choice.down.height, this.playerPosX),
		];
	}
}
