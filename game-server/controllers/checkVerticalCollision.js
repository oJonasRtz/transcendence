import { gameMap } from "../server.shared.js";

const MARGIN = 10;

export function checkVerticalCollision(newPos, actorHeight, margin) {
	const botton = newPos > ((gameMap.height - actorHeight / 2) - MARGIN);
	const top = newPos < (actorHeight / 2 + MARGIN + margin);

	return top || botton;
}
