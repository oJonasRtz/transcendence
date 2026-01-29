import { FRAME_TIME, INTERVALS, LEFT, RIGHT, stats, types } from "../../server.shared.js";

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
  #interval = null;
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
      // console.log("Ball started moving");
    }, startTime);
  }
  get direction() {
	return { ...this.#direction };
  }

  get position() {
    return { x: this.#position.x, y: this.#position.y };
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
    const distance = this.#speed.moveSpeed * delta;

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

  start(onScore, onCollision) {
    if (this.#interval) return;
  
    let lastTime = Date.now();
  
    const loop = () => {
      if (!this.#start) {
        this.#interval = setTimeout(loop, this.#networkBuffer);
        return;
      }
  
      const now = Date.now();
      const rawDelta = (now - lastTime) / 1000;
      const deltaTime = Math.min(rawDelta, 0.05); // trava delta
      lastTime = now;
  
      const scorer = this.#updatePosition(deltaTime);
  
      const hitTop = this.#position.y <= this.#margin;
      const hitBottom = this.#position.y >= stats.map.height - this.#margin;
  
      if (hitTop || hitBottom) {
        this.#position.y = hitTop
          ? this.#margin
          : stats.map.height - this.#margin;
        this.bounce("y");
      }
  
      if (onCollision()) {
        this.bounce("x");
      }
  
      if (scorer) {
        this.#interval = null;
        onScore(scorer);
        return;
      }
  
      this.#interval = setTimeout(loop, this.#networkBuffer);
    };
  
    loop();
  }

  stop() {
	if (!this.#interval) return;
	clearInterval(this.#interval);
	this.#interval = null;
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
