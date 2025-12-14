import fastify from "fastify";
import cookie from "@fastify/cookie";
import fastifyWebsocket from "@fastify/websocket";
import formbody from "@fastify/formbody";

export class Server {
	#app = fastify({ logger: true});
	#myRoutes = [
		{ method: 'POST', url: '/invite', handler: this.#invite.bind(this) }
	]
	#queue = new Map(); // <queueId, Lobby>

	constructor() {

		// this.#app.register(cookie, {
		// 	secret: process.env.COOKIE_SECRET || 'purpleVoid',
		// 	hook: 'onRequest'
		// });
		// this.#app.register(formbody);
		this.#app.register(fastifyWebsocket);

		this.#app.register(async (app) => {
			app.get('/', { websocket: true }, (socket /* SocketStream */, req /* FastifyRequest */) => {
				socket.send('Welcome to the WebSocket server!');
				socket.on('message', (message) => {
					console.log('Received message:', message.toString());
					socket.send(`Echo: ${message}`);
				});
			});
		});

		this.#routes_def();
		this.#queue.set('4002', { id: '4002', type: 'RANKED' });
	}

	#routes_def() {
		for (const route of this.#myRoutes) {
			this.#app.route(route);
		}
	}

	#invite(req, reply) {
		if (!req.body || !req.body.queue_id)
			return reply.code(400).send({ error: 'INVALID_FORMAT' });

		const { queue_id } = req.body;

		const lobby = this.#queue.get(queue_id);
		if (!lobby)
			return reply.code(404).send({ error: 'LOBBY_NOT_FOUND' });

		const host = process.env.HOSTNAME || 'localhost';
		const link = 'https://${host}/lobby?id=' + queue_id;
		return reply.code(200).send({ type: "INVITE_CREATED" ,link });
	}

	listen(port) {
		if (!port)
			port = 3020;

		this.#app.listen({port, host: '0.0.0.0'}, (err) => {
			if (err) {
				console.error('Server.listen: Error starting server:', err);
				process.exit(1);
			}
			console.log(`Server.listen: Server listening on port ${port}`);
		})
	}
}
