import * as ex from 'excalibur';
import { Birb } from './Bird.class';
import { State } from './State.class';
import { PipePair } from './PipePair.class';
import { GAME_HEIGHT, GAME_WIDTH } from '../globals';

interface SpritesType {
	bird: ex.ImageSource,
	pipe: ex.ImageSource,
}

export class Game {
	private engine: ex.Engine;
	private player: Birb | null = null;
	private pipes: PipePair[] | null = null;
	private pipeSpawnInterval = 1500; // milliseconds
	private pipeSpawnIntervalId: ReturnType<typeof setInterval> | null = null;
	private preventScrollKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
	private stopped: boolean = false;
	private state: State = new State();
	private pointsPerPipe: number = 1;
	private playerPosX: number = 100;
	private setScore: ((score: number) => void) | null = null;
	private saveHighScore: ((score: number) => void) | null = null;
	private sprites: SpritesType = {
		bird: new ex.ImageSource('/sprites/Flappy/birb.png'),
		pipe: new ex.ImageSource('/sprites/Flappy/pipe.png'),
	}

	constructor(container: HTMLElement, setScore: (score: number) => void, saveHighScore: (score: number) => void) {
		this.engine = new ex.Engine({
			width: GAME_WIDTH,
			height: GAME_HEIGHT,
			backgroundColor: new ex.Color(0.53, 0.81, 0.92, .7),
			displayMode: ex.DisplayMode.FitContainer,
			canvasElement: document.createElement('canvas'),
		});

		container.innerHTML = '';
		this.engine.canvas.style.width = '100%';
		this.engine.canvas.style.height = '100%';
		this.engine.canvas.style.objectFit = 'contain';
		container.appendChild(this.engine.canvas);
		this.setScore = setScore;
		this.saveHighScore = saveHighScore;

		this.player = new Birb(this.playerPosX, this.engine.drawHeight / 2, this.engine.drawHeight, this.sprites.bird);

		this.addToGame([this.player]);

		this.updateState();

		this.engine.on('postupdate', () => {
			if (!this.pipes) {
				this.addPipes();
				this.pipeSpawnIntervalId = setInterval(() => {
					this.addPipes();
				}, this.pipeSpawnInterval);
			}
			this.endGame();
		});

		this.preventScrollKeydownHandler = (e: KeyboardEvent) => {
			if (['ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) {
				e.preventDefault();
			}
		};
		window.addEventListener('keydown', this.preventScrollKeydownHandler);
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
			(data: ex.Actor[]) => this.addToGame(data),
			this.sprites.pipe
		);

		pipePair.on('scored', () => {
			this.state.incrementScore(this.pointsPerPipe);
			this?.setScore?.(this.state.getScore());
		});

		pipePair.on('kill', () => {
			this.pipes = this.pipes?.filter(pipe => pipe !== pipePair) || null;
		});

		this.pipes?.push(pipePair) || (this.pipes = [pipePair]);
	}

	start() {
		this.engine.start();
		this.sprites.bird.load();
		this.sprites.pipe.load();
	}

	private updateState() {
		this.state.startGame();

		this.player?.on('kill', () => this.state.endGame());
	}

	private endGame() {
		if (!this.state.isGameEnded()) return;

		this?.saveHighScore?.(this.state.getScore());
		this.stop();
	}

	public stop() {
		if (this.stopped) return;
		this.stopped = true;

		if (this.pipeSpawnIntervalId) {
			clearInterval(this.pipeSpawnIntervalId);
			this.pipeSpawnIntervalId = null;
		}
		if (this.preventScrollKeydownHandler) {
			window.removeEventListener('keydown', this.preventScrollKeydownHandler);
			this.preventScrollKeydownHandler = null;
		}

		this.engine.stop();
		this.engine.dispose();
	}
}
