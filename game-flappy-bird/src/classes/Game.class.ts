import * as ex from 'excalibur';
import { Birb } from './Bird.class';
import { Pipe } from './Pipe.class';

export class Game {
	private engine: ex.Engine;
	private player: Birb | null = null;
	private pipes: Pipe[] | null = null;
	private pipeSpawnInterval = 2000; // milliseconds

	constructor() {
		this.engine = new ex.Engine({
			width: 800,
			height: 600,
			backgroundColor: ex.Color.Blue,
			displayMode: ex.DisplayMode.FitScreen,
		});

		this.player = new Birb(100, this.engine.drawHeight / 2);

		this.addToGame([this.player]);

		this.engine.on('postupdate', () => {
			if (!this.pipes) {
				this.addPipes();
				setInterval(() => {
					this.addPipes();
				}, this.pipeSpawnInterval);
			}
		});
	}

	private addToGame(data: ex.Actor[]) {
		data.forEach((actor) => {
			this.engine.add(actor);
		});
	}

	private addPipes() {
		this.pipes = [
			new Pipe(400, 0, 50, 200),
			new Pipe(400, 400, 50, 400),
		];

		this.addToGame(this.pipes);
	}

	start() {
		this.engine.start();
	}

}
