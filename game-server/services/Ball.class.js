import { FRAME_TIME, INTERVALS, LEFT, RIGHT, stats, types } from "../server.shared.js";

export class Ball {
  #direction = { x: 0, y: 0 };
  #margin = stats?.margin ?? 10;
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

  #updatePosition() {
    this.#position.x += this.#direction.x * this.#speed.moveSpeed;
    this.#position.y += this.#direction.y * this.#speed.moveSpeed;

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
	const col = {
		1: 'y',
		'-1': 'x',
		0: null,
	}

    this.#interval = setInterval(() => {
      if (!this.#start) return;
      const scorer = this.#updatePosition();


	  const colWall = this.#position.y <= this.#margin || this.#position.y >= stats?.map?.height - this.#margin
      const colPaddle = onCollision();
	  const axis = colWall - colPaddle;

	  this.bounce(col[axis]);

      if (scorer) {
        clearInterval(this.#interval);
        this.#interval = null;
        onScore(scorer);
      }
    }, this.#networkBuffer);
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
    console.log(`Ball bounced on ${axis}-axis`);
  }
}
