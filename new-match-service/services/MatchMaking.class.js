import { Client } from "./Client.class";
import { Lobby } from "./Lobby.class";
import { Party } from "./Party.class";

export class MatchMaking {
	#queue = {
		RANKED: [], // <party>
		TOURNAMENT: [], // <party>
	}
	#maxPlayers = {
		RANKED: 2,
		TOURNAMENT: 4
	};

	constructor() {
		this.#tryMatch();
	}

	async enqueue({party}) {
		if (!(party instanceof Party))
			throw new Error('INVALID_PARAM');

		return new Promise((resolve) => {
			party.attachResolve(resolve);
			this.#queue[party.game_type].push(party);
		})
	}
	dequeue({party}) {
		if (!(party instanceof Party))
			throw new Error('INVALID_PARAM');

		this.#queue[party.game_type] = this.#queue[party.game_type].filter(e => e !== party);
	}
	#tryMatch(){
		setInterval(async () => {
			for (const type of ['RANKED', 'TOURNAMENT']) {
				const queue = this.#queue[type];
				const max = this.#maxPlayers[type];

				let collected = [];
				let cnt = 0;

				//Match loop - temp implementation: first come first served
				for (const entry of queue) {
					if (cnt + entry.size > max)
						continue;
					
					collected.push(entry);
					cnt += entry.size;

					if (cnt === max)
						break;
				}

				if (cnt !== max)
					continue;

				this.#queue[type] = this.#queue[type].filter(e => !collected.includes(e));

				const players = collected.flatMap(e => [...e.clients]);
				const lobby_id = crypto.randomUUID();
				const payload = {
					lobby_id,
					players,
				};

				for (const entry of collected) {
					entry.resolveAll(payload);
					for (const p of entry.clients) {
						p.__matchResolve = null;
					}
				}
			}
		}, 200);
	}
}
