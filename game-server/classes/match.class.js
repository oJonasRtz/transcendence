import { createId } from "../creates/createId.js";
import { Player } from "./player.class.js";
import { DISCONNECT_TIMEOUT, FPS, INTERVALS, lobby, matches, types } from "../server.shared.js";
import { Ball } from "./Ball.class.js";

function choose(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

export class Match {
	#allConnected = false;
	#players = {};
	#id = 0;
	#matchStarted = null;
	#gameStarted = false;
	#matchDuration = 0;
	#timer = null;
	#maxPlayers = 2;
	#maxScore = 11;
	#gameEnded = false;
	#timeout = null;
	#timeFormated = "00:00";
	#ball = null;
	#lastScorer = choose(["left", "right"]);
	#lastState = null;
	#pingInterval = null;

	constructor ({players, maxPlayers}) {
		try {
			if (!players || Object.keys(players).length < 2)
				throw new Error(types.error.PLAYER_MISSING);

			this.#id = createId(players[1].id, players[2].id);
			this.#maxPlayers = maxPlayers || this.#maxPlayers;
			Object.values(players).forEach((p, i) => {
				const index = i + 1;
				this.#players[index] = new Player(p,{index, matchId: this.#id} );
			});

			console.log(`New match created with ID: ${this.#id}`);
			console.log("📋 Player list:");
			Object.entries(this.#players).forEach(([slot, player]) => {
				const info = player.info;
				console.log(`  • Slot ${slot}:`, {
					id: info.id,
					name: info.name,
					score: info.score,
					direction: info.direction,
					connected: info.connected,
				});
			});
			this.#inactivityDisconnect(5);
		} catch (error) {
			if (error.name === "TypeError")
				throw new Error(types.error.TYPE_ERROR);

			throw error;
		}
	}
	get id() {
		return this.#id;
	}
	// --- Match Timer Methods ---
	#getTime(timestamp, flag = false) {
		const date = new Date(timestamp);

		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const second = String(date.getSeconds()).padStart(2, '0');

		//Flag just returns time components without date
		if (flag) return {hour, minute, second};

		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();

		return {day, month, year, hour, minute, second};
	}
	#startTimer() {
		if (!this.#matchStarted || this.#timer) return;

		this.#timer = setInterval(() => {
			this.#matchDuration = Date.now() - this.#matchStarted;

			const {minute, second} = this.#getTime(this.#matchDuration, true);
			const formatted = `${minute}:${second.toString().padStart(2, '0')}`;

			this.#timeFormated = formatted;
		}, INTERVALS);
	}
	#stopTimer() {
		if (!this.#timer) return;
		clearInterval(this.#timer);
		this.#timer = null;
	}

	// --- Utils ---
	#broadcast(message, wsToSkip = null) {
		if (!this.#allConnected) return;

		for (const p of Object.values(this.#players))
			if (!p.checkWs(wsToSkip)) {
				p.send(message);
			}
	}
	#inactivityDisconnect(minutes = 1) {
		const timeout = DISCONNECT_TIMEOUT * minutes;

		if (!this.#timeout) {
			this.#timeout = setTimeout(() => {
				console.log(`Match ${this.#id} removed due to inactivity`);
				lobby.removeMatch(this.#id, true, true);
				lobby.send({type: types.message.TIMEOUT_REMOVE, matchId: this.#id});
			}, timeout);
		}
	}

	// --- Player Connection ---
	connectPlayer(playerId, ws, name) {
		let slot = 0;
		let connected = false;
		for (const [key, p] of Object.entries(this.#players)) {
			try {
				p.connect(ws, playerId, name);
				p.send({type: types.message.CONNECT_PLAYER, id: key, matchId: this.#id});
				console.log(`Player ${key} connected to match ${this.#id}`);
				slot = key;
				connected = true;
				break;
			} catch (error) {
				console.error("Error connecting player:", error.message);
			}
		}
		if (!connected)
			throw new Error(types.error.NOT_FOUND);

		// Clear inactivity timeout
		if (this.#timeout) {
			clearTimeout(this.#timeout);
			this.#timeout = null;
		}

		// Check if all players are connected to start the game
		if (Object.values(this.#players).every(p => p.connected)) {
			this.#allConnected = true;

			console.log(`All players connected for match ${this.#id}. Starting game...`);

			if (this.#allConnected && !this.#gameStarted) {
				console.log("\x1b[33mvamos comecar essa bagaca\x1b[0m");
				this.#matchStarted = Date.now();
				this.#gameStarted = true;
				this.#startTimer();
				this.#newBall();
			}
			this.#ping();
		}

		console.log(`eu vou retornar o slot ${slot} `);
		// this.#broadcast({type: types.message.OPPONENT_CONNECTED, connected: true}, ws);
		return { matchIndex: this.#id, id: slot};
	}
	disconnectPlayer(slot) {
		const player = this.#players[slot];
		if (!player) return;

		player.destroy();
		this.#allConnected = false;
		// this.#broadcast({type: types.message.OPPONENT_DISCONNECTED, connected: false});
		
		if (this.#gameStarted && !this.#gameEnded && Object.values(this.#players).every(p => !p.connected))
			this.#inactivityDisconnect(5);
	}

	// --- Ping ---
	#ping() {
		if (this.#pingInterval) return;
	
		this.#pingInterval = setInterval(() => {
			
			const players =  Object.keys(this.#players).reduce((acc, id) => {
			acc[id] = {
				...this.#players[id].info
			};
			return acc;
			}, {});
			const ball = this.#ball ?
			{
				exists: true,
				position: {...this.#ball.position},
			}
			: {exists: false};
			const game =
			{
				started: this.#gameStarted,
				ended: this.#gameEnded,
				time: this.#timeFormated,
			}
			const message = {
				type: types.message.PING,
				players,
				ball,
				game,
			}
			const change = !this.#lastState || (
				JSON.stringify(this.#lastState) !== JSON.stringify(message)
			);
			if (change) {
				this.#broadcast(message);
				this.#lastState = message;
			}
		}, INTERVALS / FPS);
	}
	#stopPing() {
		if (this.#pingInterval) {
			clearInterval(this.#pingInterval);
			this.#pingInterval = null;
		}
	}
	pong(id) {
		const p = this.#players[id];

		if (p)
			p.send({type: "PONG"})
	}

	// --- Manage Game State ---
	endGame(winner) {
		this.#gameEnded = true;
		this.#stopTimer();

		const stats = {
			type: types.message.END_GAME,
			matchId: this.#id,
			players: Object.fromEntries(
				Array.from({length: this.#maxPlayers}, (_, i) => {;
					const p = i + 1;
					const player = this.#players[p];

					return [
						p,
						{
							id: player.id,
							name: player.name,
							score: player.score,
							winner: winner === player.name,
						}
					]
				})
			),
			time: {
				duration: this.#timeFormated,
				startedAt: (() => {
					const time = this.#getTime(this.#matchStarted);
					return `${time.day}/${time.month}/${time.year} | ${time.hour}:${time.minute}:${time.second}`;
				})(),
			}
		}

		console.log(`Sent match ${this.#id} stats to backend`);
		lobby.send(stats);
		console.log(stats);
		this.#broadcast({type: types.message.END_GAME});
	}
	input(id, direction) {
		try {
			const p = this.#players[id];

			if (!p) return;
			p.updateDirection(direction);
		} catch (error) {
			console.log("Error handling input:", error.message);
		}
	}
	#newBall() {
		this.#ball = new Ball(this.#lastScorer);
		console.log(`\x1b[35m\x1b[1m[NEW BALL] New ball created for match ${this.#id}\x1b[0m`);
		this.#updateBall({});
	}
	bounce(axis) {
		if (!this.#ball) return;
		this.#ball.bounce(axis);
	}
	#updateBall() {
		if (!this.#ball) return;

		this.#ball.updateState((scorer) => {
			this.#lastScorer = scorer;
			Object.values(this.#players).forEach((p) => {
				if (p.side === scorer && p.score < this.#maxScore) {
					p.score++;
					this.#newBall();
				}
				if (p.score >= this.#maxScore)
					this.endGame(p.name);
			});

			console.log(`Ball scored for match ${this.#id}`);
		});
	}
	// --- Cleanup ---
	destroy() {
		if (this.#timeout)
			clearTimeout(this.#timeout);
		this.#ball = null;
		this.#timeout = null;
		this.#stopTimer();
		this.#stopPing();
		Object.values(this.#players).forEach(p => {
			if (p.ws && p.ws.readyState === p.ws.OPEN)
				p.ws.close(1000, "Match ended");
		});

		delete matches[this.#id];
	}
}
