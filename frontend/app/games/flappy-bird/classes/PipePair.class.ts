import * as ex from 'excalibur';
import { Pipe } from './Pipe.class';

export class PipePair extends ex.Actor {
	private pipes: Pipe[] = [];
	private scored: boolean = false;
	private playerPosX: number = 0;
	private sprite: ex.ImageSource | null = null;

	constructor(drawHeight: number, drawWidth:number, playerX:number, addToGame: (data: ex.Actor[]) => void, sprite: ex.ImageSource | null = null) {
		super({});

		this.playerPosX = playerX;
		this.sprite = sprite;
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

	private choose<T>(arr: T[]): T{
		const index = Math.floor(Math.random() * arr.length);
		return arr[index];
	}

	private getPipePos(width: number, drawHeight: number, drawWidth: number): Pipe[] {
		const gap: number = drawHeight * .25; //Gap between pipes
		const pipeX: number = drawWidth + gap; //Spawn off screen
		// Pipes hight calculations
		const smallHeight: number = gap;
		const bigHeight: number = drawHeight - (smallHeight + gap);
		const map = {
			top: {
				up: { x: pipeX, y: 0, width, height: smallHeight},
				down: { x: pipeX, y: smallHeight + gap, width, height: bigHeight  },
			},
			bot: {
				up: { x: pipeX, y: 0, width, height: bigHeight },
				down: { x: pipeX, y: bigHeight + gap, width, height: smallHeight },
			},
			mid: {
				up: {x: pipeX, y: 0, width, height: (drawHeight - gap) / 2 },
				down: { x: pipeX, y: ((drawHeight - gap) / 2) + gap, width, height: (drawHeight - gap) / 2 },
			}
		};

		const keys = Object.keys(map);
		const i = this.choose(keys);
		const {up, down} = map[i as keyof typeof map];

		return [
			new Pipe(up.x, up.y, up.width, up.height, this.playerPosX, true, this.sprite),
			new Pipe(down.x, down.y, down.width, down.height, this.playerPosX, false, this.sprite),
		];
	}
}
