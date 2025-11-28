import db from '../app.js';

export class Client {
	#ws;
	#userInfo = {
		email: null,
		rank : null,
		name: null,
		id: null,
	};
	constructor(ws, email) {
		this.#ws = ws;
		this.#userInfo.email = email;
		db.setInQueue(email, true);
	}

	#send(data) {
		if (!data || this.#ws.readyState !== this.#ws.OPEN) return;
		this.#ws.send(JSON.stringify(data));
	}

	check(ws) {
		return this.#ws === ws;
	}

	matchFound(matchId) {
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
