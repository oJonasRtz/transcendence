import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import { Client } from './Client.class.js';
import { lobby } from '../app.js';

export class Server {
	#app = fastify();
	#queue = new Map(); // <-- key[email] = Client
	#services = {
		ENQUEUE: this.#enqueue.bind(this),
		DEQUEUE: this.#dequeue.bind(this),
	}
	#intervalMatchMaking = null;

	constructor() {
		this.#app.register(cookie, {
			secret: process.env.COOKIE_SECRET || 'purpleVoid',
			hook: 'onRequest'
		});

		this.#app.register(formbody);
		this.#app.register(fastifyWebsocket);

		this.#app.get('/ws', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
			connection.socket.on('message', (message) => {
				try {
					const data = JSON.parse(message.toString());
					const type = data.type;

					if (!type || !data.email || !data.user_id || !this.#services[type])
						throw new Error('INVALID_FORMAT');

					this.#services[type]({ ws: connection.socket, email: data.email, id: data.user_id });
				} catch (error) {
					connection.socket.send(JSON.stringify({ 
						type: 'ERROR',
						message: error.message
					}));
					return;
				}
			});
		});

		this.#matchMaking();
	}

	listen(port = 3004) {
		this.#app.listen({ port, host: '0.0.0.0' }, (err, address) => {
			if (err) {
				console.error(err);
				process.exit(1);
			}
			console.log(`Server listening at ${address}`);
		});
	}

	#matchMaking() {
		if (this.#intervalMatchMaking)
			return;

		const TIMER = 5000; // 5 seconds

		this.#intervalMatchMaking = setInterval(() => {
			const queueSize = this.#queue.size;
			if (queueSize < 2)
				return;

			const queue = Array.from(this.#queue.values());
			for (let i = 0; i < Math.floor(queueSize / 2); i++) {
				const clientA = queue[i * 2];
				const clientB = queue[i * 2 + 1];

				//Match not found, continue
				if (!clientA.checkRank(clientB.rank)) continue;

				//Match found
				// const matchId = lobby.newMatch([clientA, clientB]);
				const matchId = 42;
				clientA.matchFound(matchId);
				clientB.matchFound(matchId);
				this.#queue.delete(clientA.email);
				this.#queue.delete(clientB.email);
			}
		}, TIMER);
	}

	#enqueue({ws, email, id}) {
		if (this.#queue.has(email))
			this.#queue.get(email).destroy();

		const client = new Client({ws, email, id});
		this.#queue.set(email, client);
	}

	#dequeue({email}) {
		if (!this.#queue.has(email))
			return;

		this.#queue.get(email).destroy();
		this.#queue.delete(email);
	}

	calculateRankPoints(score1, score2, winner = true) {
		const min = 15;
		const max = 25;
		const scale = Math.max(score1, score2);
		const diff = Math.abs(score1 - score2);
		const ratio = Math.min(diff / scale, 1);

		const finalRank = min + (max - min) * ratio;

		return winner ? finalRank : -finalRank;
	}
}
