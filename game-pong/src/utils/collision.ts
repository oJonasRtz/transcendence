import { BORDERSIZE } from "../game/utils/ui/drawUi";

const MARGIN: number = 10;

export function checkVerticalCollision(newPos: number, actorHeight: number, roomHeight: number, upMargin: number): boolean {
	const bottom: boolean = newPos > ((roomHeight - actorHeight / 2) - MARGIN - BORDERSIZE);
	const top: boolean = newPos < (actorHeight / 2) + MARGIN + upMargin + BORDERSIZE;

	return bottom || top;
}
