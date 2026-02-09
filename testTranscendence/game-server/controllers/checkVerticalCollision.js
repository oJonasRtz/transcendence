import { stats } from '../server.shared.js';

export function checkVerticalCollision(newPos, actorHeight, margin) {
	const MARGIN = stats?.margin ?? 10;
	const botton = newPos > ((stats?.map?.height - actorHeight / 2) - MARGIN);
	const top = newPos < (actorHeight / 2 + MARGIN + margin);

	return top || botton;
}
