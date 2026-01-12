import { checkVerticalCollision } from "../../controllers/checkVerticalCollision.js";
import { FRAME_TIME, stats, types } from "../../server.shared.js";

export class Paddle {
	#speed = 10;
	#borderMargin = stats?.margin ?? 10;
	#spawnMargin = 50;
	#position = {x: 0, y: 0};
	#direction = {up: false, down: false};
	#size = {width: stats?.paddle?.width ?? 20, height: stats?.paddle?.height ?? 100};
	#interval = null;
	#networkBuffer = FRAME_TIME;
	#side = null;

	constructor(side) {
		const pos = {
			left: {x: this.#spawnMargin, y: stats?.map?.height / 2},
			right: {x: stats?.map?.width - this.#spawnMargin, y: stats?.map?.height / 2},
		}

		if (!(side in pos))
			throw new Error(types.error.TYPE_ERROR);
		this.#side = side;
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
	get hitBox() {
		const halfHeight = this.#size.height / 2;
		const halfWidth = this.#size.width / 2;

		return {
			top: this.#position.y - halfHeight,
			bot: this.#position.y + halfHeight,
			right: this.#position.x + halfWidth,
			left: this.#position.x - halfWidth,
		};
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
