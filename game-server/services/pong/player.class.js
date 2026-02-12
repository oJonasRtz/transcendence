import { lobby, types } from "../../server.shared.js";
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
	#lastInputSeq = 0;
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
			id: this.#id,
			name: this.#name,
			score: this.#score,
			position: {...this.#paddle.position},
			size: {...this.#paddle.size},
			connected: this.#connected,
			lastInputSeq: this.#lastInputSeq,
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
		const incomingId = String(id ?? "");
		const expectedId = String(this.#id ?? "");
		if (incomingId !== expectedId)
			throw new Error(types.error.NOT_FOUND);
		if (typeof name === "string" && name.trim() !== "" && name !== this.#name)
			this.#name = name;
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
	sendSerialized(serializedMessage) {
		try {
			if (!this.#connected || !this.#ws || this.#ws.readyState !== 1)
				throw new Error(types.error.NOT_CONNECTED);
			this.#ws.send(serializedMessage);
		} catch (error) {
			console.error("Error sending serialized message:", error.message);
		}
	}
	updateDirection(direction, inputSeq = null) {
		if (!this.#connected
			|| Object.values(direction).some(v => typeof v !== 'boolean')) return;
		
		this.#direction = {...direction};
		const parsedSeq = Number(inputSeq);
		if (Number.isFinite(parsedSeq) && parsedSeq >= 0)
			this.#lastInputSeq = Math.max(this.#lastInputSeq, Math.floor(parsedSeq));
		this.#paddle.updateDirection(this.#direction);
	}
	update(deltaSeconds) {
		this.#paddle.update(deltaSeconds);
	}
	applyHeightMultiplier(multiplier, durationMs) {
		this.#paddle.applyHeightMultiplier(multiplier, durationMs);
	}
	applySpeedMultiplier(multiplier, durationMs) {
		this.#paddle.applySpeedMultiplier(multiplier, durationMs);
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
