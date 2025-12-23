import { Lobby } from "./Lobby.class";

export class MatchMaking {
	#queue = {
		RANKED: new Set(),
		TOURNAMENT: new Set()
	}
	#maxPlayers = {
		RANKED: 2,
		TOURNAMENT: 4
	};

	constructor() {
		this.#tryMatch();
	}

	async enqueue({client, type}) {
		if (!['RANKED', 'TOURNAMENT'].includes(type))
			throw new Error('INVALID_GAME_TYPE');

		return new Promise((resolve) => {
			client.__matchResolve = resolve;
			this.#queue[type].add(client);
		})
	}
	dequeue({client, type}) {
		if (!['RANKED', 'TOURNAMENT'].includes(type))
			throw new Error('INVALID_GAME_TYPE');

		this.#queue[type].delete(client);

	}
	#tryMatch(){
		setInterval(async () => {
			for (const type of ['RANKED', 'TOURNAMENT']) {
				const queue = this.#queue[type];
				if (queue.size < 2) continue;

				//Temp check
				const it = queue.values();
				const p1 = it.next().value;
				const p2 = it.next().value;

				queue.delete(p1);
				queue.delete(p2);

				const lobby_id = crypto.randomUUID();
				// const match_id = await connection.newMatch({
				// 	players: {
				// 		1: {name: p1.name, id: p1.id},
				// 		2: {name: p2.name, id: p2.id}},
				//	}
				// 	maxPlayers: this.#maxPlayers[type],
				// 	'PONG'
				// });
				// const lobby = new Lobby({type, clients: [p1, p2], id: lobby_id, match_id});

				// const payload = {
				// 	match_id,
				// 	lobby,
				// };
				p1.__matchResolve(payload);
				p2.__matchResolve(payload);

				delete p1.__matchResolve;
				delete p2.__matchResolve;
			}
		}, 200);
	}
}
