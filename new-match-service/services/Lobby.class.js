import { resolve } from "path";
import { Client } from "./Client.class";
import { Connection } from "./Connection.class";
import { EventEmitter } from "events";

export class Lobby extends EventEmitter {
	#clients = [];
	#ids = {
		match_id: null,
		Lobby_id: null,
	};
	#valid_types = ['RANKED', 'TOURNAMENT'];
	type = null;
	#maxPlayers = {
		RANKED: 2,
		TOURNAMENT: 4
	};
	#end_game = false;

	constructor ({type, clients = [], id, match_id}) {
		if (!this.#valid_types.includes(type)
				|| !id
				|| !Array.isArray(clients)
				|| clients.length === 0
				|| !clients.every(c => c instanceof Client))
			throw new Error('INVALID_FORMAT');

		this.type = type;
		this.#clients = clients;
		this.#ids.Lobby_id = id;
		this.#ids.match_id = match_id;

		this.#manageMatch();
	}

	#manageMatch() {

	}

	async waitEnd() {
		return this.#end_game
			|| new Promise((resolve) => {
				this.once('END_GAME', () => {
					resolve();
				});
			});
	}

	get isFull() {
		return this.#clients.length === this.#maxPlayers[this.type];
	}

	setEnd_game({setter, data}) {
		if (!(setter instanceof Connection))
			throw new Error('PERMISSION_DENIED');

		//send data to dataBase
		
		this.#end_game = true;
		this.emit('END_GAME');
	}

	#broadcast(message) {
		this.#clients.forEach(client => {
			client.send(message);
		});
	}
}
