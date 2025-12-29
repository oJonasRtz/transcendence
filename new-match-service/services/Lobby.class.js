import { Client } from "./Client.class.js";
import { Connection } from "./Connection.class.js";
import { EventEmitter } from "events";
import { gameServer } from "../app.js";

export class Lobby extends EventEmitter {
	#clients = [];
	#ids = {
		match_id: [],
		Lobby_id: null,
	};
	#valid_types = ['RANKED', 'TOURNAMENT'];
	type = null;
	#maxPlayers = {
		RANKED: 2,
		TOURNAMENT: 4
	};
	#end_game = false;

	constructor ({type, clients = [], id}) {
		super();
		if (!this.#valid_types.includes(type)
				|| !id
				|| !Array.isArray(clients)
				|| clients.length === 0
				|| !clients.every(c => c instanceof Client))
			throw new Error('INVALID_FORMAT');

		this.type = type;
		this.#clients = clients;
		this.#ids.Lobby_id = id;
		try{
			this.#manageMatch();
		}catch(error){
			console.error('Lobby: Error managing match:', error.message);
		}
	}

	async #newMatch({players}) {
		if (!gameServer)
			throw new Error('NO_GAME_SERVER_AVAILABLE');

		const match_id = await gameServer.newMatch(players, 2, 'PONG');
		this.#ids.match_id.push(match_id);
		return match_id;
	}

	async #manageMatch() {
		if (!gameServer)
			throw new Error('NO_GAME_SERVER_AVAILABLE');

		switch (this.type) {
			case 'RANKED':
				const players = {};
				this.#clients.forEach((client, index) => {{
					players[index + 1] = {name: client.name, id: client.id};
				}})
				const match_id = await this.#newMatch({players});
				this.#broadcast({type: 'MATCH_FOUND', match_id});
				break;
			case 'TOURNAMENT':
				while (!this.#end_game) {
					const gamesCount = 0;
					const howManyGames = this.#clients.length;

					if (gamesCount >= howManyGames) break;
				}
				break;
		}
	}

	async waitEnd() {
		if (this.#end_game)
			return Promise.resolve();

		return new Promise((resolve) => {
			this.once('END_GAME', resolve);
		});
	}

	get isFull() {
		return this.#clients.length === this.#maxPlayers[this.type];
	}

	end_game({setter, match_id}) {
		if (!(setter instanceof Connection))
			throw new Error('PERMISSION_DENIED');

		if (this.#end_game) return;

		if (!this.#ids.match_id.includes(match_id))
			throw new Error('INVALID_MATCH_ID');

		this.#ids.match_id.delete(match_id);

		switch (this.type) {
			case 'RANKED':
				this.#end_game = true;
				this.emit('END_GAME');
				break;
		}
	}

	#broadcast(message) {
		this.#clients.forEach(client => {
			client.send(message);
		});
	}
}
