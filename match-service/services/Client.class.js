import {db} from '../app.js';

export class Client {
	#ws;
	#userInfo = {
		email: null,
		rank : null,
		name: null,
		id: null,
	};
	#matchId = null;

	constructor({ws, email, id, name}) {
		this.#ws = ws;
		this.#userInfo.email = email;
		this.#userInfo.id = id;
		this.#userInfo.name = name;
		db.setInQueue(email, true);

		
	}

	get info() {
		return {
			name: this.#userInfo.name,
			id: this.#userInfo.id,
		};
	}

	get id() {
		return this.#userInfo.id;
	}

	get match() {
		return this.#matchId;
	}

	get rank() {
		return this.#userInfo.rank;
	}
	get email() {
		return this.#userInfo.email;
	}

	#send(data) {
		if (!data || this.#ws.readyState !== this.#ws.OPEN) return;
		this.#ws.send(JSON.stringify(data));
	}

	checkRank(rank) {
		// const diff = Math.abs(rank - this.#userInfo.rank);
		// const cap = this.#userInfo.rank * .1; // 10% of player's rank

		// return diff <= cap;
		return true;
	}

	matchFound(matchId) {
		this.#matchId = matchId;
		db.setInQueue(this.#userInfo.email, false);
		db.setMatchId(this.#userInfo.email, matchId);
		this.#send({ type: 'SUCCESS', matchId: matchId });
		db.setInGame(this.#userInfo.email, true);
		this.#ws.close();
	}

	finish() {
		db.setInGame(this.#userInfo.email, false);
		db.setMatchId(this.#userInfo.email, null);
	}

	//dequeue use
	destroy() {
		if (this.#ws.readyState === this.#ws.OPEN) {
			this.#send({ type: 'DEQUEUE', status: 'SUCCESS' });
			this.#ws.close();
		}
		db.setInQueue(this.#userInfo.email, false);
	}
}
