import WebSocket from "ws";
import fs from "fs";

export class Connection {
	#socket = null;
	#matchPromise = null;
	#login = {
		id: process.env.LOBBY_ID,
		pass: process.env.LOBBY_PASS,
	}
	#server = {
		ip: fs.readFileSync('/app/shared/server.ip', 'utf-8').trim(),
		port: process.env.PORT_LOBBY,
	};
	#reconnection = {
		delay: 5000,
		canReconnect: true,
	}
	#types = {
		recieves: {
			CONNECTED: "LOBBY_CONNECTED",
			MATCHCREATED: "MATCH_CREATED",
			TIMEOUT: "TIMEOUT_REMOVE",
			GAME_END: "END_GAME",
			ERROR: "ERROR",
		},
		sends: {
			CONNECT: "CONNECT_LOBBY",
			NEWMATCH: "NEW_MATCH",
			REMOVEMATCH: "REMOVE_MATCH",
		},
	}
	
	connect() {
		this.#reconnection.canReconnect = true;
		this.#socket = new WebSocket(`wss://${this.#server.ip}:${this.#server.port}`);

		this.#socket.onopen = () => {
			this.#send({
				type: this.#types.sends.CONNECT,
				...this.#login,
			});
		};

		this.#socket.onmessage = (event) => {
			const message = JSON.parse(event.data);

			this.#handleMessage(message);
		};

		this.#socket.onerror = (error) => {
			console.error("Connection.connect: WebSocket error:", error.message);
			this.#reconnect();
		};
		this.#socket.onclose = (event) => {
			console.log(`Connection.connect: Disconnected from server (code: ${event.code})`);

			this.#reconnect();
		};
	}

	#handleMessage(message) {
		const map = {
			[this.#types.recieves.CONNECTED]: () => {
				console.log("Connection.#handleMessage: Connected to lobby server.");
			},
			[this.#types.recieves.GAME_END]: () => {
				//Chama calculate rank para atualizar o db
			},
			[this.#types.recieves.MATCHCREATED]: () => {
				if (this.#matchPromise) {
					this.#matchPromise(message.matchId);
					this.#matchPromise = null;
				}
			},
			[this.#types.recieves.TIMEOUT]: () => {
				console.log(`Connection.#handleMessage: Match ${message.matchId} timed out and was removed.`);
			},
			[this.#types.recieves.ERROR]: () => {
				console.error(`Connection.#handleMessage: Error from server: ${message.error}`);
			},
		}
		try {
			const type = message.type;

			if (!(type in map)) return;

			map[type]();	
		} catch (error) {
			console.error("Connection.#handleMessage: Error handling message: ", error);
		}
	}

	#reconnect() {
		if (!this.#reconnection.canReconnect
			|| !this.#socket
			|| this.#socket.readyState === WebSocket.CONNECTING
			|| this.#socket.readyState === WebSocket.OPEN)
			return;

		setTimeout(() => {
			console.log("Connection.#reconnect: Attempting to reconnect...");
			this.connect();
		}, this.#reconnection.delay);
	}

	#send(message) {
		if (this.#socket && this.#socket.readyState === WebSocket.OPEN)
			this.#socket.send(JSON.stringify(message));
	}

	newMatch(players, maxPlayers) {
		return new Promise((resolve) => {
			this.#matchPromise = resolve;

			this.#send({
				type: this.#types.sends.NEWMATCH,
				players,
				maxPlayers,
			});


		});
	}

	disconnect() {
		if (!this.#socket)
			return;

		this.#reconnection.canReconnect = false;
		this.#socket.close();
	}
}
