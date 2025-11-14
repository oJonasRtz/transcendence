const MARGIN: number = 10;

export function checkVerticalCollision(newPos: number, actorHeight: number, roomHeight: number, upMargin: number): boolean {
	const bottom: boolean = newPos > ((roomHeight - actorHeight / 2) - MARGIN);
	const top: boolean = newPos < (actorHeight / 2) + MARGIN + upMargin;

	return bottom || top;
}
