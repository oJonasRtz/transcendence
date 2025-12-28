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
	private gameOverShown: boolean = false;
	private pipeSpawnTimer: number | null = null;

	constructor() {
		this.engine = new ex.Engine({
			width: GAME_WIDTH,
			height: GAME_HEIGHT,
			backgroundColor: ex.Color.Blue,
			displayMode: ex.DisplayMode.FillScreen,
		});
		this.player = new Birb(this.playerPosX, this.engine.drawHeight / 2, this.engine.drawHeight);

		this.addToGame([this.player]);

		this.updateState();

		this.engine.on('postupdate', () => {
			if (!this.pipes && !this.pipeSpawnTimer) {
				this.addPipes();
				this.pipeSpawnTimer = setInterval(() => {
					if (!this.state.isGameEnded()) {
						this.addPipes();
					}
				}, this.pipeSpawnInterval);
			}

			this.endGame();
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
		if (this.gameOverShown) return; // Only show once

		console.log("[GameEnd] e isso eh tudo pessoal");

		this.gameOverShown = true;

		// Clear the pipe spawn timer to prevent memory leaks
		if (this.pipeSpawnTimer) {
			clearInterval(this.pipeSpawnTimer);
			this.pipeSpawnTimer = null;
		}

		// Freeze all game entities
		if (this.player) {
			this.player.body.vel = ex.Vector.Zero;
			this.player.body.acc = ex.Vector.Zero;
			this.player.actions.clearActions();
		}

		// Freeze all pipe actors in the scene
		this.engine.currentScene.actors.forEach((actor) => {
			if (actor.hasTag && actor.hasTag('pipe')) {
				actor.body.vel = ex.Vector.Zero;
				actor.actions.clearActions();
			}
		});

		// Show Game Over screen while keeping engine running
		this.showGameOverScreen();
	}

	private showGameOverScreen() {
		// Semi-transparent dark overlay
		const overlay = new ex.ScreenElement({
			x: 0,
			y: 0,
			width: this.engine.drawWidth,
			height: this.engine.drawHeight,
			color: new ex.Color(0, 0, 0, 0.7),
		});

		// Game Over text
		const gameOverText = new ex.Label({
			text: 'GAME OVER',
			pos: new ex.Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 - 80),
			font: new ex.Font({
				size: 48,
				bold: true,
				color: ex.Color.White,
				textAlign: ex.TextAlign.Center,
			}),
		});

		// Score text
		const scoreText = new ex.Label({
			text: `Score: ${this.state.getScore()}`,
			pos: new ex.Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2),
			font: new ex.Font({
				size: 32,
				color: ex.Color.Yellow,
				textAlign: ex.TextAlign.Center,
			}),
		});

		// Click to restart instruction
		const restartText = new ex.Label({
			text: 'Click to Restart',
			pos: new ex.Vector(this.engine.drawWidth / 2, this.engine.drawHeight / 2 + 60),
			font: new ex.Font({
				size: 24,
				color: ex.Color.White,
				textAlign: ex.TextAlign.Center,
			}),
		});

		this.engine.add(overlay);
		this.engine.add(gameOverText);
		this.engine.add(scoreText);
		this.engine.add(restartText);
	}
}
