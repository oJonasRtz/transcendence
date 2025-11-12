import * as ex from 'excalibur';
import { score, state } from '../../../globals';
import { MidleLine } from '../../../utils/midleLine';
import { addElements } from './addElements';
import { BACKGROUND } from '../../../globals';

const TEXT_Y: number = 20;
export const BORDERSIZE: number = 20;

function createLabel(text: string, font: ex.Font, x: number, y: number): ex.Label {
	return new ex.Label({
		text,
		font,
		color: ex.Color.White,
		pos: ex.vec(x, y),
	});
}

const ground = new ex.Actor({
	width: BACKGROUND.width - BORDERSIZE,
	height: BACKGROUND.height - BORDERSIZE,
	x: BACKGROUND.width / 2,
	y: BACKGROUND.height / 2,
	color: ex.Color.Black,
	z: 0,
});
export const border = new ex.Actor({
	width: BACKGROUND.width,
	height: BACKGROUND.height,
	x: BACKGROUND.width / 2,
	y: BACKGROUND.height / 2,
	color: ex.Color.Blue,
	z: 0,
});

export function drawUi() {
	const timerFont = new ex.Font({
		family: 'Impact',
		size: this.game.font.size * 0.6,
		color: ex.Color.White,
		textAlign: ex.TextAlign.Center
	});

	this.game.timeLabel = createLabel(state.timer, timerFont, this.game.engine.drawWidth / 2, TEXT_Y + this.game.font.size + 10);
	this.game.scoreLabel = createLabel(`${score[1]?.name} - ${score[2]?.name}`, this.game.font, this.game.engine.drawWidth / 2, TEXT_Y);
	this.height = this.game.timeLabel.pos.y + timerFont.size + 10;

	const middleLine = new MidleLine(this.game.engine.drawWidth / 2, this.height, 5, this.game.engine.drawHeight - TEXT_Y - BORDERSIZE);
	const player1 = createLabel(`${score[1]?.name}`, this.game.font, this.game.engine.drawWidth * .2, TEXT_Y);
	const player2 = createLabel(`${score[2]?.name}`, this.game.font, this.game.engine.drawWidth * .8, TEXT_Y);

	addElements.call(this, [ border, ground, middleLine, player1, player2, this.game.scoreLabel, this.game.timeLabel]);
	this.game.border = border;
}
  
export function countTime() {
	if (!state.allOk) return;

	this.game.timeLabel.text = state.timer;
}
