import { lobby, types } from "../server.shared.js";

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
	#matchId = 0;

	constructor(data, {index, matchId}) {
		const side = ((index + 1) % 2 === 0) ? "left" : "right";
		this.#id = data.id;
		this.#name = data.name;
		this.#side = side;
		this.#matchId = matchId;
		this.#slot = index;
	}
	get info() {
		return {
			id: this.#id,
			name: this.#name,
			score: this.#score,
			direction: {...this.#direction},
			connected: this.#connected,
		}
	}
	get connected() {
		return this.#connected;
	}
	get side() {
		return this.#side;
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
		console.log(`[Player ${this.#name}] connected to match ${this.#matchId}`);

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
	}
	destroy(err = null) {
		this.#ws.close();
		this.#ws = null;
		this.#connected = false;

		if (err) {
			console.log(`[Player ${this.#name}] disconnected from match ${this.#matchId}:`, err.code, err.reason);
		}
	}
}
