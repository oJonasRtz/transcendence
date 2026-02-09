import { Lobby } from "./Lobby.class.js";
import { Party } from "./Party.class.js";
import crypto from 'crypto';

const DIFF_TO_ALLOW = 100;

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

		this.#queue[party.game_type].push(party);
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

				queue.sort((a, b) => a.rank - b.rank);

				const baseParty = queue[0];
				if (!baseParty) continue;

				const baseRank = baseParty.rank;

				let collected = [];
				let cnt = 0;
				
				//match
				for (const party of queue) {
					if (Math.abs(party.rank - baseRank) > DIFF_TO_ALLOW) continue;

					if (cnt + party.size > max) continue;

					collected.push(party);
					cnt += party.size;

					if (cnt === max) break;
				}

				if (cnt !== max) continue;

				this.#queue[type] = this.#queue[type].filter(party => !collected.includes(party));


				//create lobby
				try {
					const players = collected.flatMap(p => [...p.clients]);
					const id = crypto.randomBytes(16).toString('hex');
					const lobby = new Lobby({type, clients: players, id});

					for (const party of collected) {
						if (party.resolve)
							party.resolve({lobby});
				}
				} catch (error) {
					console.error('MatchMaking:#tryMatch: Error creating lobby:', error.message);
				}
			}
		}, 200);
	}
}
