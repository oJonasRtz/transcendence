import { checkVerticalCollision } from "../../controllers/checkVerticalCollision.js";
import { stats, types } from "../../server.shared.js";

export class Paddle {
	#baseSpeed = stats?.paddle?.speed ?? 600;
	#borderMargin = stats?.margin ?? 10;
	#spawnMargin = 50;
	#position = {x: 0, y: 0};
	#direction = {up: false, down: false};
	#baseSize = {width: stats?.paddle?.width ?? 20, height: stats?.paddle?.height ?? 100};
	#modifiers = {
		speed: 1,
		height: 1,
	};
	#modifierTimers = {
		speed: null,
		height: null,
	};
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
		return;
	}

	get position() {
		return {x: this.#position.x, y: this.#position.y};
	}
	get size() {
		return {
			width: this.#baseSize.width,
			height: this.#baseSize.height * this.#modifiers.height,
		};
	}
	get hitBox() {
		const size = this.size;
		const halfHeight = size.height / 2;
		const halfWidth = size.width / 2;

		return {
			top: this.#position.y - halfHeight,
			bot: this.#position.y + halfHeight,
			right: this.#position.x + halfWidth,
			left: this.#position.x - halfWidth,
		};
	}

	stop() {
		this.#clearModifiers();
	}

	updateDirection({up, down}) {
		if (this.#direction.up === up && this.#direction.down === down)
			return;

		this.#direction = {up, down};
	}

	update(deltaSeconds = 0) {
		if (!deltaSeconds) return;

		this.#updatePosition(deltaSeconds);
	}

	#updatePosition(deltaSeconds) {
		const moveSpeed = this.#getMoveSpeed() * deltaSeconds;
		const size = this.size;

		if (checkVerticalCollision(this.#position.y + moveSpeed, size.height, this.#borderMargin))
			return;

		this.#position.y += moveSpeed;
	}

	#getMoveSpeed() {
		const dir = this.#direction.down - this.#direction.up;

		return dir * this.#baseSpeed * this.#modifiers.speed;
	}

	#clearModifiers() {
		for (const key of Object.keys(this.#modifierTimers)) {
			if (this.#modifierTimers[key]) {
				clearTimeout(this.#modifierTimers[key]);
				this.#modifierTimers[key] = null;
			}
		}

		this.#modifiers.speed = 1;
		this.#modifiers.height = 1;
	}

	applySpeedMultiplier(multiplier = 1, durationMs = 0) {
		if (typeof multiplier !== "number" || multiplier <= 0) return;
		const duration = Math.max(0, Number(durationMs) || 0);

		this.#modifiers.speed = multiplier;
		if (this.#modifierTimers.speed) clearTimeout(this.#modifierTimers.speed);
		if (!duration) return;

		this.#modifierTimers.speed = setTimeout(() => {
			this.#modifiers.speed = 1;
			this.#modifierTimers.speed = null;
		}, duration);
	}

	applyHeightMultiplier(multiplier = 1, durationMs = 0) {
		if (typeof multiplier !== "number" || multiplier <= 0) return;
		const duration = Math.max(0, Number(durationMs) || 0);

		this.#modifiers.height = multiplier;
		if (this.#modifierTimers.height) clearTimeout(this.#modifierTimers.height);
		if (!duration) return;

		this.#modifierTimers.height = setTimeout(() => {
			this.#modifiers.height = 1;
			this.#modifierTimers.height = null;
		}, duration);
	}
}
