import { checkVerticalCollision } from "../controllers/checkVerticalCollision.js";
import { FRAME_TIME, gameMap } from "../server.shared.js";

export class Paddle {
	#speed = 8;
	#borderMargin = 10;
	#spawnMargin = 50;
	#position = {x: 0, y: 0}
	#direction = {up: false, down: false};
	#size = {width: 20, height: 100};
	#interval = null;
	#networkBuffer = FRAME_TIME;	

	constructor(side) {
		const pos = {
			left: {x: this.#spawnMargin, y: gameMap.height / 2},
			right: {x: gameMap.width - this.#spawnMargin, y: gameMap.height / 2},
		}

		this.#position = {...pos[side]};
	}

	start() {
		if (this.#interval)
			return;

		this.#interval = setInterval(() => {
			this.#updatePosition();
		}, this.#networkBuffer);
	}

	get position() {
		return {x: this.#position.x, y: this.#position.y};
	}
	get size() {
		return {width: this.#size.width, height: this.#size.height};
	}

	stop() {
		if (!this.#interval)
			return;

		clearInterval(this.#interval);
		this.#interval = null;
	}

	updateDirection({up, down}) {
		if (this.#direction.up === up && this.#direction.down === down)
			return;

		this.#direction = {up, down};
	}

	#updatePosition() {
		const moveSpeed = this.#getMoveSpeed();

		if (checkVerticalCollision(this.#position.y + moveSpeed, this.#size.height, this.#borderMargin))
			return;

		this.#position.y += moveSpeed;
	}

	#getMoveSpeed() {
		const dir = this.#direction.down - this.#direction.up;

		return dir * this.#speed;
	}
}
