import { state } from "../../globals";
import { Ball } from "../actors/ball";

export function ballReset() {
	if (state.ballPos.exist || state.gameEnd) return;
	
	const ball = new Ball(this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.height);
	state.ballPos.exist = true;
	state.gameStarted = true;

	this.game.engine.add(ball);
}
