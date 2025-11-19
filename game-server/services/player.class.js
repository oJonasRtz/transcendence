import { lobby, types } from "../server.shared.js";
import { Paddle } from "./Paddle.class.js";

export class Player {
	#id;
	#slot = -1;
	#name;
	#score = 0;
	#connected = false;
	#notifyEnd = false;
	#ws = null;
	#notifyBallDeath = false;
	#side;
	#direction = {up: false, down: false};
	#paddle;
	#matchId = 0;

	constructor(data, {index, matchId}) {
		const side = ((index + 1) % 2 === 0) ? "left" : "right";
		this.#id = data.id;
		this.#name = data.name;
		this.#side = side;
		this.#matchId = matchId;
		this.#slot = index;
		this.#paddle = new Paddle(this.#side);
	}
	get info() {
		return {
			id: this.#slot,
			name: this.#name,
			score: this.#score,
			position: {...this.#paddle.position},
			size: {...this.#paddle.size},
			connected: this.#connected,
		}
	}
	get hitBox() {
		return this.#paddle.hitBox;
	}
	get connected() {
		return this.#connected;
	}
	get side() {
		return this.#side;
	}
	get score() {
		return this.#score;
	}
	set score(value) {
		if (typeof value === 'number' && value >= 0)
			this.#score = value;
	}
	get notifyEnd() {
		return this.#notifyEnd;
	}
	get notifyBallDeath() {
		return this.#notifyBallDeath;
	}
	get slot() {
		return this.#slot;
	}
	// --- Player Methods ---
	checkWs(ws) {
		return this.#ws === ws;
	}

	connect(ws, id, name) {
		if (id !== this.#id || name !== this.#name) 
			throw new Error(types.error.NOT_FOUND);
		if (this.#connected) {
			lobby.send({
				type: types.message.ERROR,
				error: types.error.DUP,
				matchId: this.#matchId,
				playerId: this.#id,
			});
			throw new Error(types.error.DUP);
		}
		this.#ws = ws;
		this.#connected = true;
		this.#paddle.start();

		this.#ws.on("close", (err) => this.destroy(err));
		this.#ws.on("error", (err) => this.destroy(err));
	}
	send(message) {
		try {
			if (!this.#connected || !this.#ws || this.#ws.readyState !== 1)
				throw new Error(types.error.NOT_CONNECTED);
			this.#ws.send(JSON.stringify({...message, timestamp: Date.now()}));
		} catch (error) {
			console.error("Error sending message:", error.message);
		}
	}
	updateDirection(direction) {
		if (!this.#connected
			|| Object.values(direction).some(v => typeof v !== 'boolean')) return;
		
		this.#direction = {...direction};
		this.#paddle.updateDirection(this.#direction);
	}
	destroy(err = null) {
		if (this.#ws) {
			try {this.#ws.close()} catch (error) {}
			this.#ws = null;
		}
		this.#connected = false;
		this.#paddle.stop();

		if (err)
			console.log(`[Player ${this.#name}] disconnected from match ${this.#matchId}:`, err.code, err.reason);
	}
}
