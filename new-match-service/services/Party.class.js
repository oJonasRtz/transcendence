import { Client } from "./Client.class.js";
import { matchMaking } from '../app.js';

export class Party {
	#leader = null;
	#state = 'IDLE' // 'IDLE' | 'IN_QUEUE'
	#token = null;
	#game_type = null; // 'RANKED' | 'TOURNAMENT'
	#clients = new Set();
	#resolves = new Set();
	#createdByInvite = false;
	#max = {
		RANKED: 2,
		TOURNAMENT: 4
	};
	resolve = null;

	constructor({token, game_type}) {
		if (!token || !game_type || !['RANKED', 'TOURNAMENT'].includes(game_type))
			throw new Error('INVALID_FORMAT');

		this.#token = token;
		this.#game_type = game_type;
	}

	get createdByInvite() {
		return this.#createdByInvite;
	}

	set createdByInvite(value) {
		this.#createdByInvite = Boolean(value);
	}

	get state() {
		return this.#state;
	}
	
	get token() {
		return this.#token;
	}

	get game_type() {
		return this.#game_type;
	}

	get clients() {
		return this.#clients;
	}

	get leader() {
		return this.#leader;
	}

	get size() {
		return this.#clients.size;
	}

	get avgRank() {
		if (this.#clients.size === 0)
			return 0;

		const totalRank = [...this.#clients].reduce((sum, client) => sum + client.rank, 0);
		return Math.floor(totalRank / this.#clients.size);
	}

	#registerClientWait() {
		this.#clients.forEach(client => {
			this.#resolves.add(client);
		});
	}

	#clearClientWait(matchFound = false, payload = {}) {
		if (!matchFound) {
			this.#clients.forEach(c => {
				if (c?.promisses?.reject) {
					c.promisses.reject(new Error('PARTY_DEQUEUED'));
					c.promisses.resolve = null;
					c.promisses.reject = null;
				}
			})
		}
		else {
			this.#clients.forEach(c => {
				if (c?.promisses?.resolve) {
					c.promisses.resolve(payload);
					c.promisses.resolve = null;
					c.promisses.reject = null;
				}
			})
		}

		this.#resolves.clear();
	}

	addClient(client, isLeader = false) {
		if (!client || !(client instanceof Client))
			throw new Error('INVALID_CLIENT');

		if (this.size === this.#max[this.#game_type])
			throw new Error('PARTY_FULL');

		if (this.#clients.has(client))
			throw new Error('CLIENT_ALREADY_IN_PARTY');

		this.#clients.add(client);
		client.setParty(this);
		if (isLeader || this.#leader === null)
			this.#leader = client;
		
		this.#broadcast({
			type: "PARTY_UPDATED",
		});

		console.log("Clients in party: ", [...this.#clients].map(c => c.name));
	}

	removeClient(client) {
		if (!client || !(client instanceof Client ))
			throw new Error('INVALID_CLIENT');

		if (!this.#clients.has(client))
			throw new Error('CLIENT_NOT_IN_PARTY');

		this.#clients.delete(client);
		client.setParty(null);

		this.#broadcast({
			type: "PARTY_UPDATED",
		});
	}

	#broadcast(message) {
		this.#clients.forEach(client => {
			client.send(message);
		});
	}

	enqueue(caller) {
		if (this.#state === 'IN_QUEUE'
			|| caller !== this.#leader
		)
			return;

		if (!caller
			|| !(caller instanceof Client)
			|| !this.#clients.has(caller)
		)
			throw new Error('INVALID_CALLER');
	
		this.#registerClientWait();
		this.#state = 'IN_QUEUE';
		this.resolve = (payload) => this.#onMatchFound(payload);

		matchMaking.enqueue({
			party: this
		});
	}

	#onMatchFound(payload = {}) {
		this.#state = 'IDLE';

		this.#clearClientWait(true, payload);
		this.#clients.clear();
	}

	dequeue() {
		if (this.#state === 'IDLE')
			return;

		this.#state = 'IDLE';

		this.#clearClientWait(false);

		this.#clients.forEach(c => {
			c.setParty(null);
		});

		matchMaking.dequeue({party: this});
	}
}
