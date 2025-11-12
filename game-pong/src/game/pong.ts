import { BACKGROUND, MAXSCORE, score, state } from '../globals';
import { MyLabel } from '../utils/myLabel';
import * as ex from 'excalibur';
import { Paddle } from './actors/paddle';
import { waitOpponentConnect } from '../utils/waitingOpponentConnect';
import { drawPlayers } from './utils/ui/drawPlayers';
import { countTime, drawUi } from './utils/ui/drawUi';
import { ballReset } from './utils/ballReset';
import { disconnected } from './utils/disconnected';
import { endMatch } from './utils/endMatch';

const FPS: number = 60;

type PongType = {
	engine?: ex.Engine;
	timeLabel?: ex.Label;
	startMatch?: number;
	scoreLabel?: ex.Label;
	maxScore: number;
	matchTime?: string;
	winner?: string;
	paddle1?: Paddle;
	paddle2?: Paddle;
	height: number; 
	font?: ex.Font;
	pauseLabel?: MyLabel;
	desconnectedLabel?: MyLabel;
	timer?: ex.Timer;
	border?: ex.Actor;
}

export class Pong {
	game: PongType = {
		maxScore: MAXSCORE,
		height: 50
	};

	constructor() {
		this.game.engine = new ex.Engine({ ...BACKGROUND});


		const fontSize = Math.min(this.game.engine.drawWidth, this.game.engine.drawHeight) * 0.05;
		this.game.font = new ex.Font({
			family: 'Impact',
			size: fontSize,
			color: ex.Color.White,
			textAlign: ex.TextAlign.Center
		});

		drawUi.call(this);
		drawPlayers.call(this);

		//Global listeners - roda a cada frame
		this.game.engine.on('preupdate', () => {

			//Var to lock the game
			// gameState.allOk = gameState.connected && gameState.opponentConnected;
			state.allOk = Object.values(state.connection).every(Boolean);
			//this is not working already its just an idea for future improvements
			//change the border color according to the score
			if (Object.values(score).some(s => s.score > this.game.maxScore / 2)) this.game.border.color = ex.Color.Purple;
			if (Object.values(score).some(s => s.score === this.game.maxScore - 1)) this.game.border.color = ex.Color.Red;

			this.game.scoreLabel.text = `${score[1]?.score} - ${score[2]?.score}`;
			countTime.call(this);
			endMatch.call(this);
			ballReset.call(this);
			disconnected.call(this);
			waitOpponentConnect(this.game.engine, this.game.font);
		})
	}

	start(): void {
		this.game.engine.start();
	}
}
