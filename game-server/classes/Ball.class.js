import { INTERVALS, types } from "../server.shared.js";

export class Ball {
	#direction = {x: 0, y: 0};
	#position = {x: 0, y: 0};
	#speed = .3;
	#lastBounce = null;
	#DELAY = 100;
	#interval = null;
	#start = false;
	#networkBuffer = INTERVALS / FPS;
	#map = {width: 800, height: 600};

	constructor(lastScorer) {
		const dir = {"left": -1, "right": 1};

		if (!(lastScorer in dir))
			throw new Error(types.error.TYPE_ERROR);
		const vector = {
			x: !lastScorer ? this.#getRandom() : dir[lastScorer],
			y: this.#getRandom(),
		};

		this.#direction = vector;
		const startTime = INTERVALS; //1sec + message letency buffer

		setTimeout(() => {
			this.#start = true;
		}, startTime);
	}

	get position() {
		return {
			position: {...this.#position}
		};
	}

	#getRandom() {
		return (Math.random() < 0.5 ? -1 : 1);
	}

	#updatePosition() {
		this.#position.x += this.#direction.x * this.#speed
		this.#position.y += this.#direction.y * this.#speed;

		const i = (this.#position.x <= 0) - (this.#position.x >= this.#map.width);
		const scorer = {
			0: null,
			1: "right",
			"-1": "left",
		};

		return scorer[i];
	}

	updateState(onScore) {
		if (!this.#start || this.#interval) return;

		this.#interval = setInterval(() => {
			if (!this.#start) return;
			const scorer = this.#updatePosition();
			if (this.#position.y <= 0 || this.#position.y >= this.#map.height)
				this.bounce('y');
			if (scorer) {
				clearInterval(this.#interval);
				this.#interval = null;
				onScore(scorer);
			}
		}, this.#networkBuffer);
	}

	bounce(axis) {
		const now = Date.now();

		if (!this.#lastBounce)
			this.#lastBounce = {axis, time: now - this.#DELAY};

		const sameAxis = this.#lastBounce.axis === axis;
		const tooSoon = now - this.#lastBounce.time < this.#DELAY;

		if (sameAxis && tooSoon) return;

		this.#lastBounce = {axis, time: now};

		const axisMap = {
			'x': () => {
				this.#direction.x = -this.#direction.x;
				if (this.#speed < 1.5) this.#speed += 0.2;
			},
			'y': () => { this.#direction.y = -this.#direction.y; },
		};

		if (!(axis in axisMap))
			throw new Error(types.error.TYPE_ERROR);

		axisMap[axis]();
		console.log(`Ball bounced on ${axis}-axis`);
	}
}
