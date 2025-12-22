export class Client {
	#info = {
		id: null,
		name: null,
		email: null,
		rank: null,
	};
	#ws = null;
	#sendBuffer = [];
	#state = 'IDLE';
	//Finite State Machine methods
	#FSM = {
		IDLE: (payload) => this.#idle(payload),
		IN_QUEUE: async (payload) => await this.#in_queue(payload),
		IN_GAME: async (payload) => await this.#in_game(payload),
	}
	//Allowed state transitions
	#transitions = {
		IDLE: ['IN_QUEUE'],
		IN_QUEUE: ['IN_GAME', 'IDLE'],
		IN_GAME: ['IDLE'],
	}
	//External actions that can be performed on the client
	#actions = {
		ENQUEUE: async () => await this.#changeState('IN_QUEUE', {}),
		DEQUEUE: async () => {
			//matchmaking.dequeue({client: this, type: this.#game_type});
			await this.#changeState('IDLE', {});
		},
		INVITE: async () => await this.#changeState('IDLE', {create_invite: true}),
		EXIT: () => this.#disconnect(),
	}
	#disconnections = {
		IDLE: () => this.#inIdleDisconnect(),
		IN_QUEUE: () => this.#inQueueDisconnect(),
		IN_GAME: () => this.#inGameDisconnect(),
	}
	#valid_game_types = ['RANKED', 'TOURNAMENT'];
	#game_type = null;
	#game = {
		match_id: null,
		lobby_id: null,
		lobby: null,
	}

	constructor ({ws, email, id, name}) {
		if (![ws, email, id, name].every(Boolean))
			throw new Error('INVALID_FORMAT');

		this.#game_type = game_type;
		this.#ws = ws;
		this.#info.id = id;
		this.#info.name = name;
		this.#info.email = email;

		//get Rank on database using email

		this.#listeners();
		this.#idle({});
	}

	get name() {
		return this.#info.name;
	}

	get id() {
		return this.#info.id;
	}

	#idle({create_invite}) {

		if (create_invite) {
			// Logic to create an invite can be added here
		}
	}

	async #in_queue({}) {

		//match found
		// const matchPayload = await matchmaking.enqueue({
		// 	client: this,
		// 	type: this.#game_type
		//	rank: this.#info.rank
		// })
		// this.#changeState('IN_GAME', matchPayload);
	}
	async #in_game({match_id, lobby}) {
		// if (!match_id || !lobby)
		// 	throw new Error('INVALID_FORMAT');

		// this.#game.match_id = match_id;
		// this.#game.lobby = lobby;
		// this.#game.lobby_id = lobby.id;

		// this.send({
		// 	type: 'MATCH_FOUND',
		// 	match_id,
		// });

		// await lobby.waitEnd();
		
		// this.#game.match_id = null;
		// this.#game.lobby = null;
		// this.#game.lobby_id = null;

		// this.send({
		// 	type: 'MATCH_ENDED',
		// });

		// this.#changeState('IDLE', {});
	}

	async handleActions(data) {
		try {
			const {to} = data;

			if (!to || !(to in this.#actions))
				throw new Error('INVALID_ACTION');

			return await this.#actions[to](data);
		} catch (error) {
			console.error('Client.handleMessage: Error handling message:', error.message);
			throw new Error(error.message);
		}
	}

	async #changeState(to, payload = {}) {
		const allowed = this.#transitions[this.#state];
		if (!allowed.includes(to))
			throw new Error('INVALID_STATE_TRANSITION');

		this.#state = to;
		await this.#FSM[this.#state](payload);
	}

	#listeners() {
		if (!this.#ws)
			return;

		this.#ws.on('open', () => {
			this.#flushPending();
		});

		this.#ws.on('error', (error) => {
			console.error(`Client ${this.#info.email} WebSocket error:`, error.message);
		});

		this.#ws.on('close', () => {
			console.log(`Client ${this.#info.email} disconnected.`);
		});
	}

	reconnect(ws) {
		this.#ws = ws;
		
		if (this.#state === 'IN_GAME') {
			//Check if lobby still exists before sending reconnection message
			//if not change state to IDLE


			// this.send({
			// 	type: 'RECONNECTED_TO_GAME',
			// 	match_id: this.#game.match_id,
			// });
			//this.#game.lobby.reconnectClient(this);

			//this.changeState('IDLE', {});
		}

		this.#listeners();
	}

	#flushPending() {
		while (this.#sendBuffer.length > 0 && this.#ws.readyState === this.#ws.OPEN) {
			const message = this.#sendBuffer.shift();
			this.send(message);
		}
	}

	send(data) {
		if (!data)
			return;
		if (this.#ws.readyState !== this.#ws.OPEN)
			return this.#sendBuffer.push(data);

		this.#ws.send(JSON.stringify(data));
	}

	#disconnect() {
		if (!this.#ws || this.#ws.readyState !== this.#ws.OPEN)
			return;
		
		const res = this.#disconnections[this.#state]();
		this.#ws.close();
		this.#ws = null;
		return res;
	}

	#inIdleDisconnect() {
		this.#sendBuffer = [];
		return ("REMOVE");
	}

	#inQueueDisconnect() {
		// matchmaking.dequeue({client: this, type: this.#game_type});
		this.#sendBuffer = [];
		return ("REMOVE");
	}

	#inGameDisconnect() {
		//this.#game.lobby.notifyDisconnect(this);
		return ("KEEP");
	}
}
