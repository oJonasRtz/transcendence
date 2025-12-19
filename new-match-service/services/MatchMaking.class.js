export class MatchMaking {
	#queue = {
		RANKED: new Set(),
		TOURNAMENT: new Set()
	}

	constructor() {
		this.#tryMatch();
	}

	enqueue({client, type}) {
		if (!['RANKED', 'TOURNAMENT'].includes(type))
			throw new Error('INVALID_GAME_TYPE');

		this.#queue[type].add(client);
	}
	dequeue({client, type}) {
		if (!['RANKED', 'TOURNAMENT'].includes(type))
			throw new Error('INVALID_GAME_TYPE');

		this.#queue[type].delete(client);

	}
	#tryMatch(){
		setInterval(() => {
			
		}, 1000);
	}
}