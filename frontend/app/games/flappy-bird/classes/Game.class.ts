import * as ex from 'excalibur';
import { Birb } from './Bird.class';
import { State } from './State.class';
import { PipePair } from './PipePair.class';
import { GAME_HEIGHT, GAME_WIDTH } from '../globals';

export class Game {
	private engine: ex.Engine;
	private player: Birb | null = null;
	private pipes: PipePair[] | null = null;
	private pipeSpawnInterval = 1500; // milliseconds
	private state: State = new State();
	private pointsPerPipe: number = 1;
	private playerPosX: number = 100;

	constructor(container: HTMLElement) {
		this.engine = new ex.Engine({
			width: GAME_WIDTH,
			height: GAME_HEIGHT,
			backgroundColor: ex.Color.Blue,
			displayMode: ex.DisplayMode.FitScreen,
			canvasElement: document.createElement('canvas'),
		});

		container.innerHTML = '';
		container.appendChild(this.engine.canvas);

		this.player = new Birb(this.playerPosX, this.engine.drawHeight / 2, this.engine.drawHeight);

		this.addToGame([this.player]);

		this.updateState();

		this.engine.on('postupdate', () => {
			if (!this.pipes) {
				this.addPipes();
				setInterval(() => {
					this.addPipes();
				}, this.pipeSpawnInterval);
			}

			this.endGame();
		});

		window.addEventListener('keydown', (e) => {
			if (['ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) {
				e.preventDefault();
			}
		});
	}

	private addToGame(data: ex.Actor[]) {
		data.forEach((actor) => {
			this.engine.add(actor);
		});
	}


	private addPipes() {
		const pipePair = new PipePair(
			this.engine.drawHeight,
			this.engine.drawWidth,
			this.playerPosX,
			(data: ex.Actor[]) => this.addToGame(data)
		);

		pipePair.on('scored', () => {
			this.state.incrementScore(this.pointsPerPipe);
		});

		pipePair.on('kill', () => {
			this.pipes = this.pipes?.filter(pipe => pipe !== pipePair) || null;
		});

		this.pipes?.push(pipePair) || (this.pipes = [pipePair]);
	}

	start() {
		this.engine.start();
	}

	private updateState() {
		this.state.startGame();

		this.player?.on('kill', () => this.state.endGame());
	}

	private endGame() {
		if (!this.state.isGameEnded()) return;

		console.log("[GameEnd] e isso eh tudo pessoal");
		this.stop();
	}

	public stop() {
		this.engine.stop();
		this.engine.dispose();
	}
}
