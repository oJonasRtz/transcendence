import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import { Client } from './Client.class';

export class Server {
	#app = fastify();
	#queue = new Map(); // <-- key[email] = Client
	#services = {
		ENQUEUE: this.#enqueue.bind(this),
		DEQUEUE: this.#dequeue.bind(this),
	}

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

					if (!type || !data.email || !this.#services[type])
						throw new Error('INVALID_FORMAT');

					this.#services[type]({ ws: connection.socket, email: data.email });
				} catch (error) {
					connection.socket.send(JSON.stringify({ 
						type: 'ERROR',
						message: error.message
					}));
					connection.socket.close();
				}
			});
		});
	}

	listen(port = 3004) {
		this.#app.listen({ port }, (err, address) => {
			if (err) {
				console.error(err);
				process.exit(1);
			}
			console.log(`Server listening at ${address}`);
		});
	}

	#matchMaking() {}

	#enqueue({ws, email}) {
		if (this.#queue.has(email))
			this.#queue.get(email).destroy();

		const client = new Client(ws, email);
		this.#queue.set(email, client);

		//this.#matchMaking();
	}

	#dequeue({email}) {
		if (!this.#queue.has(email))
			return;

		this.#queue.get(email).destroy();
		this.#queue.delete(email);
	}
}
