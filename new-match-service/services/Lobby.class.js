import {gameServer} from '../app.js';

export class Lobby {
	#clients = new Map();
	#id;
	#type;
	#game;
	#limit = {
		['PONG']: 2,
		['FLAPPY']: 6,
	}
	#matchId = null;

	constructor({id, type, game, owner}) {
		if (!(owner instanceof Client)
				|| !type
				|| !game
				|| !['RANKED', 'TOURNAMENT'].includes(type)
				|| !['PONG', 'FLAPPY'].includes(game))
			throw new Error('INVALID_FORMAT');

		this.#id = id;
		this.#type = type;
		this.#game = game;
		this.addClient(owner);
	}

	addClient(client) {
		if (this.isMatchFound())
			throw new Error('LOBBY_FULL');

		this.#clients.set(client.id, client);
	}

	isClientInLobby(clientId) {
		return this.#clients.has(clientId);
	}

	async isMatchFound() {
		const matchFound = this.#clients.size >= this.#limit[this.#game];
		
		if (matchFound && !this.#matchId) {
			const players = Object.keys(this.#clients).reduce((acc, id) => {
				acc[id] = {...this.#clients.get(id).info}
				return acc;
			}, {});
			const game = this.#game;
			const maxPlayers = this.#limit[this.#game];

			this.#matchId = await gameServer.newMatch({players, maxPlayers, game});
			this.#broadcast({
				type: 'MATCH_FOUND',
				matchId: this.#matchId,
				game,
			});
		}
		return matchFound;
	}

	#broadcast(message) {
		this.#clients.forEach(client => {
			client.send(message);
		});
	}

	get type() {
		return this.#type;
	}
	get id() {
		return this.#id;
	}

	set matchId(matchId) {
		this.#matchId = matchId;
	}

	get matchId() {
		return this.#matchId;
	}
}
