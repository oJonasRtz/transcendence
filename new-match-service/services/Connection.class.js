import WebSocket from "ws";

export class Connection {
	#socket = null;
	#matchesRunning = new Map() // <match_id, Lobby>
	#matchQueue = [];
	#login = {
		id: process.env.LOBBY_ID,
		pass: process.env.LOBBY_PASS,
	}
	#server = {
		ip: "game-server",
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
	
	#getUrl() {
		return `ws://${this.#server.ip}:${this.#server.port}/`;
	}

	connect() {
		this.#reconnection.canReconnect = true;
		const url = this.#getUrl();
		console.log(`Connection.connect: Connecting to lobby server at ${url}...`);
		this.#socket = new WebSocket(url);

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

	#endGame(match_id, timeout = false) {
		const lobby = this.#matchesRunning.get(match_id);

		console.log("chegamos na endGame");
		
		if (!lobby)
			return;

		console.log(`vamos remover o match ${match_id} do lobby`);


		lobby.end_game({setter: this, match_id}, timeout);
		this.#send({
			type: this.#types.sends.REMOVEMATCH,
			matchId: match_id,
		})

		this.#matchesRunning.delete(match_id);
		console.log(`Connection.#endGame: Match ${match_id} ended and removed from running matches.`);
	}

	#handleMessage(message) {
		const map = {
			[this.#types.recieves.CONNECTED]: () => {
				console.log("Connection.#handleMessage: Connected to lobby server.");
			},
			[this.#types.recieves.GAME_END]: () => {
				this.#endGame(message.matchId);
			},
			[this.#types.recieves.MATCHCREATED]: () => {
				const next = this.#matchQueue.shift();
				if (next) next(message.matchId);
			},
			[this.#types.recieves.TIMEOUT]: () => {
				console.log(`Connection.#handleMessage: Match ${message.matchId} timed out and was removed.`);
			},
			[this.#types.recieves.ERROR]: () => {
				console.error(`Connection.#handleMessage: Error from server: ${message.error}`);
			},
			["TIMEOUT_REMOVE"]: () => {
				this.#endGame(message.matchId, true);
			}
		}
		try {
			const type = message.type;

			if (!(type in map)) return;

			console.log(`Reacieved ${type} message from lobby server.`);

			if (type === this.#types.recieves.GAME_END)
				console.log(`Message: ${JSON.stringify(message)}`);

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

	newMatch(players, maxPlayers, game, Lobby) {
		return new Promise((resolve) => {
			this.#matchQueue.push((matchId) => {
				this.#matchesRunning.set(matchId, Lobby);
				console.log("O lobby que acompanha a conexão recebeu o matchId:", matchId);
				resolve(matchId);
			});

			this.#send({
				type: this.#types.sends.NEWMATCH,
				players,
				maxPlayers,
				game,
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
