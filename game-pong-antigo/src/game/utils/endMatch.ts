import { LANGUAGE, score, state, texts } from "../../globals";
import { MyLabel } from "../../utils/myLabel";

export function endMatch() {
	if (Object.values(score).every(s => s.score < this.game.maxScore)) return;
	
	const winner = Object.values(score).find(s => s.score >= this.game.maxScore)?.name;	
	const winnerLabel = new MyLabel(`${winner} ${texts[LANGUAGE].win}`, this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.game.font);
	state.gameEnd = true;
	// notifyEnd(winner as string);
	this.game.engine.add(winnerLabel);
	this.game.engine.stop();
}
