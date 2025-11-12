import { Paddle } from "../../actors/paddle";
import { addElements } from "./addElements";

const DISTANCE_FROM_WALL = 50;

export function drawPlayers() {
	const paddle1 = new Paddle(DISTANCE_FROM_WALL, this.game.engine.drawHeight / 2, 1, this.height);
	const paddle2 = new Paddle(this.game.engine.drawWidth - DISTANCE_FROM_WALL, this.game.engine.drawHeight / 2, 2, this.height);

	addElements.call(this, [paddle1, paddle2]);
}
