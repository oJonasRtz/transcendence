import * as ex from 'excalibur';

export class MidleLine extends ex.Actor {
	constructor(x: number, y: number, width: number, height: number) {
		super({
			x: x,
			y: y,
			width: width,
			height: height,
			color: ex.Color.White,
			anchor: ex.vec(0, 0)
		});
	}
}
