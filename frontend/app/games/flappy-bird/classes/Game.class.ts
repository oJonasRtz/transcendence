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
	private state: State = new State();
	private scoreLabel: ex.Label | null = null;
	private pointsPerPipe: number = 1;
	private playerPosX: number = 100;
	private sprites: SpritesType = {
		bird: new ex.ImageSource('/sprites/Flappy/birb.png'),
		pipe: new ex.ImageSource('/sprites/Flappy/pipe.png'),
	}

	constructor(container: HTMLElement) {
		this.engine = new ex.Engine({
			width: GAME_WIDTH,
			height: GAME_HEIGHT,
			backgroundColor: ex.Color.Blue,
			displayMode: ex.DisplayMode.Fixed,
			canvasElement: document.createElement('canvas'),
		});

		container.innerHTML = '';
		container.appendChild(this.engine.canvas);

		this.player = new Birb(this.playerPosX, this.engine.drawHeight / 2, this.engine.drawHeight, this.sprites.bird);

		this.addToGame([this.player]);

		this.updateState();
		this.addScoreLabel();

		this.engine.on('postupdate', () => {
			if (!this.pipes) {
				this.addPipes();
				setInterval(() => {
					this.addPipes();
				}, this.pipeSpawnInterval);
			}
			this.updateScore();
			this.endGame();
		});

		window.addEventListener('keydown', (e) => {
			if (['ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) {
				e.preventDefault();
			}
		});
	}

	private updateScore() {
		if (this.scoreLabel)
			this.scoreLabel.text = `Score: ${this.state.getScore()}`;
	}

	private addScoreLabel() {
		this.scoreLabel = new ex.Label({
			text: 'Score: 0',
			x: 20,
			y: 20,
			z: 100,
			color: ex.Color.White,
			font: new ex.Font({
				family: 'Arial',
				size: 24,
				unit: ex.FontUnit.Px,
				shadow: {
					color: ex.Color.Black,
					offset: ex.vec(2, 2),
					blur: 0,
				}
			}),
		});

		this.engine.add(this.scoreLabel);
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

		console.log("[GameEnd] e isso eh tudo pessoal");
		this.stop();
	}

	public stop() {
		this.engine.stop();
		this.engine.dispose();
	}
}
