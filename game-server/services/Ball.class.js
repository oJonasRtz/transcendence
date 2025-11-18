import { FPS, gameMap, INTERVALS, types } from "../server.shared.js";

export class Ball {
  #direction = { x: 0, y: 0 };
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
  #networkBuffer = INTERVALS / FPS;
  #position = { x: gameMap.width / 2, y: gameMap.height / 2 };
 
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

  #getRandom() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  #updatePosition() {
    this.#position.x += this.#direction.x * this.#speed.moveSpeed;
    this.#position.y += this.#direction.y * this.#speed.moveSpeed;

    const hitLeft = this.#position.x <= this.#margin;
    const hitRight = this.#position.x >= gameMap.width - this.#margin;
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
      if (this.#position.y <= 0 || this.#position.y >= gameMap.height)
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
        if (this.#speed.moveSpeed < this.#speed.maxSpeed) this.#speed += this.#speed.speedIncrement;
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
