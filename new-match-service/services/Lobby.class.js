
export class Lobby {
	#states = ['IDLE', 'QUEUE', 'IN_GAME'];
	#types = ['RANKED', 'TOURNAMENT'];
	#type = null;
	#state = null;
	#clients = new Map();
	#clientsLimit = {
		RANKED: 2,
		TOURNAMENT: 4
	};
	#maxClients = null;
	#id = null;
	#stateMachine = {
		IDLE: this.#idle,
		QUEUE: this.#in_queue,
		IN_GAME: this.#in_game
	}
	#interval = null;

	constructor({type, state, owner, id}) {
		if (![type, state, id, owner].every(Boolean)
				|| !this.#types.includes(type)
				|| !this.#states.includes(state)
				|| !(owner instanceof Client))
			throw new Error('INVALID_FORMAT');

		this.#type = type;
		this.#state = state;
		this.addClient(owner);
		this.#id = id;
		this.#maxClients = this.#clientsLimit[type];

		this.startFSM();
	}

	startFSM(time = 1000) {
		if (this.#interval)
			return;

		this.#interval = setInterval(() => {
			this.#stateMachine[this.#state]();
		}, time);
	}

	stopFSM() {
		if (this.#interval) {
			clearInterval(this.#interval);
			this.#interval = null;
		}
	}

	get game_type() {
		return this.#type;
	}
	get state() {
		return this.#state;
	}
	get isFull() {
		return this.#clients.size === this.#maxClients;
	}

	/*
		State = IN_GAME type = any
		What it can do:
			- Can't change state
			- calculate results and update database when games are over
			- finish the connections
			- type = TOURNAMENT
				- build tournament keys
				- manage tournament brackets
				- all clients play at least two games
				keys exemple:
					B1: P1 vs P2	-	B1(W) vs B2(W)
					B2: P3 vs P4	-	B1(L) vs B2(L)
				- the final scores are calculated based on positions in the brackets
				Scores exemple:
					1st place: +100 points
					2nd place: +50 points
					3rd place: -50 points
					4th place: -100 points
	*/
	#in_game(){}

	/*
		State = IDLE type = any
		What it can do:
			- Create invite link
			- change to QUEUE state
	*/
	#idle() {

	}

	/*
		State = QUEUE type = any
		What it can do:
			- change back to IDLE state if DEQUEUED
			- check if full -> change to IN_GAME state
	*/
	#in_queue() {
		/*
			join the matchmaking system and wait

			Create a matchMaking class
				-> it'll have
					const queue = {
						RANKED: Set<Lobby>,
						TOURNAMENT: Set<Lobby>
					};
				-> it'll try to match lobbies every X seconds
				-> when matched move all player for one the lobbies and delete the others

		*/

		// if (this.isFull)
		// 	this.#updateState('IN_GAME');
	}

	//state = IN_GAME type = TOURNAMENT
	#buidTournamentKeys() {
		if (this.#type !== 'TOURNAMENT')
			return [];
	}

	addClient(client) {
		if (this.#clients.size === this.#clientsLimit)
			throw new Error('LOBBY_FULL');

		this.#clients.set(client.id, client);
	}

	isClientInLobby(clientId) {
		return this.#clients.has(clientId);
	}

	#updateState(newState) {
		if (!this.#states.includes(newState))
			throw new Error('INVALID_STATE');

		this.#state = newState;
	}
}
