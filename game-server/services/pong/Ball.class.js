import { INTERVALS, LEFT, RIGHT, stats, types } from "../../server.shared.js";

export class Ball {
  #direction = { x: 0, y: 0 };
  #margin = stats?.margin ?? 10;
  #size = {
	width: stats?.ball?.width ?? 20,
	height: stats?.ball?.height ?? 20,
  }
  #speed = {
    moveSpeed: 300,
    speedIncrement: 30,
    maxSpeed: 600,
  };
  #lastBounce = null;
  #DELAY = 100;
  #start = false;
  #startTimeout = null;
  #position = { x: stats?.map?.width / 2, y: stats?.map?.height / 2 };
  #speedMultiplier = 1;
  #speedTimer = null;
 
  constructor(lastScorer) {
    const dir = { left: -1, right: 1 };

    const vector = {
      x: !lastScorer ? this.#getRandom() : dir[lastScorer],
      y: this.#getRandom(),
    };

    this.#direction = vector;
  }
  get direction() {
	return { ...this.#direction };
  }

  get position() {
    return { x: this.#position.x, y: this.#position.y };
  }
  get radius() {
    return this.#size.width / 2;
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

  #getRandom() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  #updatePosition(delta) {
    const distance = this.#speed.moveSpeed * this.#speedMultiplier * delta;

    this.#position.x += this.#direction.x * distance;
    this.#position.y += this.#direction.y * distance;

    const hitLeft = this.#position.x <= this.#margin;
    const hitRight = this.#position.x >= stats?.map?.width - this.#margin;
    const i = hitLeft - hitRight;
    const scorer = {
      0: null,
      [RIGHT]: "right",
      [LEFT]: "left",
    };

    return scorer[i];
  }

  start() {
    this.#start = false;
    if (this.#startTimeout) {
      clearTimeout(this.#startTimeout);
      this.#startTimeout = null;
    }
    this.#startTimeout = setTimeout(() => {
      this.#start = true;
      this.#startTimeout = null;
    }, INTERVALS);
  }

  update(deltaSeconds, onScore, onCollision) {
    if (!this.#start) return;

    const safeDelta = Math.min(Math.max(Number(deltaSeconds) || 0, 0), 0.05);
    if (!safeDelta) return;

    const scorer = this.#updatePosition(safeDelta);

    const hitTop = this.#position.y <= this.#margin;
    const hitBottom = this.#position.y >= stats.map.height - this.#margin;

    if (hitTop || hitBottom) {
      this.#position.y = hitTop ? this.#margin : stats.map.height - this.#margin;
      this.bounce("y");
    }

    if (onCollision()) {
      this.bounce("x");
    }

    if (scorer) {
      onScore(scorer);
    }
  }

  stop() {
	this.#start = false;
	if (this.#startTimeout) {
	  clearTimeout(this.#startTimeout);
	  this.#startTimeout = null;
	}
	if (this.#speedTimer) {
	  clearTimeout(this.#speedTimer);
	  this.#speedTimer = null;
	}
	this.#speedMultiplier = 1;
  }

  applySpeedMultiplier(multiplier = 1, durationMs = 0) {
    if (typeof multiplier !== "number" || multiplier <= 0) return;
    const duration = Math.max(0, Number(durationMs) || 0);

    this.#speedMultiplier = multiplier;

    if (this.#speedTimer) clearTimeout(this.#speedTimer);
    if (!duration) return;

    this.#speedTimer = setTimeout(() => {
      this.#speedMultiplier = 1;
      this.#speedTimer = null;
    }, duration);
  }


  bounce(axis) {
	if (!axis || (axis !== 'x' && axis !== 'y')) return;
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
    // console.log(`Ball bounced on ${axis}-axis`);
  }
}
