import { LANGUAGE, state, texts } from "../../globals";
import { MyLabel } from "../../utils/myLabel";

let label: MyLabel;

export function disconnected(): void {
	if (state.gameEnd) return;
	if (!label)
		label = new MyLabel(texts[LANGUAGE].disconnect, this.game.engine.drawWidth / 2, this.game.engine.drawHeight / 2, this.game.font);

	if (state.allOk && this.game.engine.currentScene.actors.includes(label))
		this.game.engine.currentScene.remove(label);
	else if ((!state.connection.me || !state.connection.opponent) && !this.game.engine.currentScene.actors.includes(label))
		this.game.engine.add(label);
}
