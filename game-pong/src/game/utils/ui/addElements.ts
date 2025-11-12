export function addElements(elements: ex.Actor[]): void {

	for (const el of elements)
		this.game.engine.add(el);
}