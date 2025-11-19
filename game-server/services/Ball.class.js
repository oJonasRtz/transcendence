import { FRAME_TIME, INTERVALS, stats, types } from "../server.shared.js";

export class Ball {
  #direction = { x: 0, y: 0 };
  #size = {
	width: stats?.ball?.width ?? 20,
	height: stats?.ball?.height ?? 20,
  }
  #speed = {
    moveSpeed: 5,
    speedIncrement: 1,
    maxSpeed: 8,
  };
  #lastBounce = null;
  #DELAY = 100;
  #interval = null;
  #margin = 10;
  #start = false;
  #networkBuffer = FRAME_TIME;
  #position = { x: stats?.map?.width / 2, y: stats?.map?.height / 2 };
 
  constructor(lastScorer) {
    const dir = { left: -1, right: 1 };

    const vector = {
      x: !lastScorer ? this.#getRandom() : dir[lastScorer],
      y: this.#getRandom(),
    };

    this.#direction = vector;
    const startTime = INTERVALS; //1sec + message letency buffer

    setTimeout(() => {
      this.#start = true;
      console.log("Ball started moving");
    }, startTime);
  }

  get position() {
    return { x: this.#position.x, y: this.#position.y };
  }
  get hitBox() {
	const halfHeight = this.#size.height / 2;
	const halfWidth = this.#size.width / 2;

	const top = this.#position.y - halfHeight;
	const bot = this.#position.y + halfHeight;
	const x = {
		1: this.#position.x + halfWidth,
		"-1": this.#position.x - halfWidth,
	};

	return {
		top,
		bot,
		x: x[this.#direction.x],
	}
  }

  #getRandom() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  #updatePosition() {
    this.#position.x += this.#direction.x * this.#speed.moveSpeed;
    this.#position.y += this.#direction.y * this.#speed.moveSpeed;

    const hitLeft = this.#position.x <= this.#margin;
    const hitRight = this.#position.x >= stats?.map?.width - this.#margin;
    const i = hitLeft - hitRight;
    const scorer = {
      0: null,
      1: "right",
      "-1": "left",
    };

    return scorer[i];
  }

  updateState(onScore) {
    if (this.#interval) return;

    this.#interval = setInterval(() => {
      if (!this.#start) return;
      const scorer = this.#updatePosition();
      if (this.#position.y <= 0 || this.#position.y >= stats?.map?.height)
        this.bounce("y");
      if (scorer) {
        clearInterval(this.#interval);
        this.#interval = null;
        onScore(scorer);
      }
    }, this.#networkBuffer);
  }

  bounce(axis) {
    const now = Date.now();

    if (!this.#lastBounce) this.#lastBounce = { axis, time: now - this.#DELAY };

    const sameAxis = this.#lastBounce.axis === axis;
    const tooSoon = now - this.#lastBounce.time < this.#DELAY;

    if (sameAxis && tooSoon) return;

    this.#lastBounce = { axis, time: now };

    const axisMap = {
      x: () => {
        this.#direction.x = -this.#direction.x;
        if (this.#speed.moveSpeed < this.#speed.maxSpeed) this.#speed.moveSpeed += this.#speed.speedIncrement;
      },
      y: () => {
        this.#direction.y = -this.#direction.y;
      },
    };

    if (!(axis in axisMap)) throw new Error(types.error.TYPE_ERROR);

    axisMap[axis]();
    console.log(`Ball bounced on ${axis}-axis`);
  }
}
