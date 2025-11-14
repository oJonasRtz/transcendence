import * as ex from 'excalibur';

export class MyLabel extends ex.Actor {
	constructor(text: string,
				x: number,
				y: number,
				font: ex.Font,
				textColor: ex.Color = ex.Color.White,
				bgColor: ex.Color = ex.Color.Blue,
				padding: number = 20
	){
		super({
			x,
			y,
			z: 1000,
			anchor: ex.Vector.Half,
		});

		const label = new ex.Label({
			text,
			font,
			color: textColor,
			pos: ex.vec(0, 0),
			anchor: ex.Vector.Half
		});
		const metrics = font.measureText(text);

		const bg = new ex.Actor({
			width: metrics.width + padding,
			height: metrics.height + padding,
			color: bgColor,
			anchor: ex.Vector.Half,
			pos: ex.vec(0, padding)
		});

		this.addChild(bg);
		this.addChild(label);
	}
}
