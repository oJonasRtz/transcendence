// import * as ex from 'excalibur';
// import { Paddle } from './paddle';
// import { ballPos, gameState, identity } from '../../globals';
// import { checkVerticalCollision } from '../../utils/collision';
// import { updateStats } from '../../connection/utils/getScore';
// import { BORDERSIZE } from '../utils/ui/drawUi';
// import { notifyBounce } from '../../connection/notify/notifyBounce';
// import { notifyNewBall } from '../../connection/notify/notifyNewBall';
// import { notifyBallDeath } from '../../connection/notify/notifyBallDeath';

// export let side: number = 0;
// export const pos: BallPosition = {
// 	x: Number(gameState.side > .5) - Number(gameState.side < .5),
// 	y: Number(gameState.side > .5) - Number(gameState.side < .5),
// }

// const SPEED: number = 0.3;

// export class Ball extends ex.Actor {
// 	speed: number;
// 	direction: ex.Vector;
// 	start: boolean = false;
// 	upMargin: number;
// 	constructor(x: number, y: number, upMargin: number = 0) {
// 		super({
// 			x: x,
// 			y: y,
// 			width: 20,
// 			height: 20,
// 			color: ex.Color.White,
// 			collisionType: ex.CollisionType.Passive
// 		});
// 		this.upMargin = upMargin;

// 		//Velocidade proporcional a tela
// 		const screenFactor = Math.sqrt(window.innerHeight * window.innerWidth) / 1000;
// 		this.speed = SPEED * screenFactor;
// 		this.direction = new ex.Vector(ballPos.x, ballPos.y).normalize();
// 	}

// 	//Executa apenas uma vez, quando o ator entra na cena
// 	onInitialize(): void {
// 		notifyNewBall();

// 		const now = Date.now();
// 		const delay = Math.max(0, ballPos.startTime - now);

// 		setTimeout(() => (this.start = true), delay);
 
// 		this.on('collisionstart', (col) => {
// 			if (col.other.owner instanceof Paddle) {
// 				notifyBounce('x');
// 			}
// 		})
// 	}

// 	//Codigo que roda a cada frame
// 	onPreUpdate(engine: ex.Engine, delta: number): void {

// 		if (!this.start) return;

// 		const moveSpeedx: number = this.speed * delta;
// 		const moveSpeedy: number = this.speed * delta;

// 		if (checkVerticalCollision(this.pos.y + moveSpeedy, this.height, engine.drawHeight, this.upMargin))
// 			notifyBounce('y');

// 		const right: boolean = this.pos.x > engine.drawWidth - BORDERSIZE;
// 		const left: boolean = this.pos.x < BORDERSIZE;

// 		if (left || right) {
// 			notifyBallDeath(left ? "left" : "right");
// 			gameState.ballInGame = !gameState.ballInGame;
// 			updateStats(identity.id);
// 			this.kill();
// 		}

// 		this.pos.x += ballPos.x * moveSpeedx;
// 		this.pos.y += ballPos.y * moveSpeedy;
// 	}
// }

import * as ex from 'excalibur';
import { state } from '../../globals';
import { Paddle } from './paddle';
import { notifyBounce } from '../../connection/notify/notifyBounce';

export class Ball extends ex.Actor {
	constructor() {
		super({
			width: 20,
			height: 20,
			color: ex.Color.White,
			collisionType: ex.CollisionType.Passive
		});
	}

	onInitialize(): void {
		this.pos.x = state.ballPos.vector.x;
		this.pos.y = state.ballPos.vector.y;

		this.on('collisionstart', (col) => {
			if (col.other.owner instanceof Paddle)
				notifyBounce('x');
		});
	}

	onPreUpdate(_engine: ex.Engine, _delta: number): void {
		if (!state.allOk || !state.ballPos.exist) return;
		
		this.pos.x = state.ballPos.vector.x;
		this.pos.y = state.ballPos.vector.y;
	}
}
