import fastify from "fastify";
import cookie from "@fastify/cookie";
import fastifyWebsocket from "@fastify/websocket";
import formbody from "@fastify/formbody";
import { Client } from "./Client.class.js";

export class Server {
	#app = fastify();
	#myRoutes = [
		{ method: 'POST', url: '/invite', handler: this.#invite.bind(this) }
	];
	#queue = new Map(); // <queueId, Lobby>
	#lobby = new Map(); // <queueId, Lobby>
	#clients = new Map(); // <ws, Client>
	#handlers = {
		'CONNECT': this.#onConnect.bind(this),
		'ENQUEUE': this.#enqueue.bind(this),
		'DEQUEUE': this.#dequeue.bind(this),
		'EXIT': this.#exit.bind(this),
	};

	constructor() {
		this.#app.register(formbody);
		this.#app.register(fastifyWebsocket);

		this.#app.register(async (app) => {
			app.get('/', { websocket: true }, (socket /* SocketStream */, req /* FastifyRequest */) => {
				socket.send('Welcome to the WebSocket server!');
				socket.on('message', (message) => {
					const data = JSON.parse(message);
					console.log('Received message:', data);
					const client = this.#clients.get(socket);
					this.#handleMessages({data, client, socket});
				});
			});
		});

		this.#routes_def();
		const client = new Client({ws: null, email: 'system', id: 'system', name: 'system'});
		this.#queue.set('4002', { owner: client, game_type: 'RANKED' });
	}

	#routes_def() {
		for (const route of this.#myRoutes) {
			this.#app.route(route);
		}
	}

	#handleMessages({data, client, ws}) {
		try {
			const {type} = data;

			if (!type || !(type in this.#handlers))
				throw new Error('INVALID_FORMAT');

			if (!client && type !== 'CONNECT')
				throw new Error('NOT_CONNECTED');

			const c = client || ws;
			this.#handlers[type](data, c);
		} catch (error) {
			console.error('Server.#handleMessages: Error handling message:', error.message);
		}
	}

	#enqueue({queue_id}, client) {
		try {
			if (!queue_id)
				throw new Error('INVALID_FORMAT');

			if (!this.#lobby.has(queue_id))
				throw new Error('QUEUE_NOT_FOUND');
			const lobby = this.#lobby.get(queue_id);
			this.#lobby.delete(queue_id);
			this.#queue.set(queue_id, lobby);
			client.send({
				type: 'ENQUEUED',
				queue_id,
			});

		} catch (error) {
			console.error('Server.#enqueue: Error processing enqueue:', error.message);
			client.send({
				type: 'ERROR',
				message: error.message
			});
		}
	}

	#dequeue({queue_id}, client) {
		try {
			if (!queue_id)
				throw new Error('INVALID_FORMAT');

			if (!this.#queue.has(queue_id))
				throw new Error('QUEUE_NOT_FOUND');
			const lobby = this.#queue.get(queue_id);
			this.#queue.delete(queue_id);
			this.#lobby.set(queue_id, lobby);
			client.send({
				type: 'DEQUEUED',
				queue_id,
			});

		} catch (error) {
			console.error('Server.#dequeue: Error processing dequeue:', error.message);
			client.send({
				type: 'ERROR',
				message: error.message
			});
		}
	}

	#exit({queue_id}, client) {
		try {
			if (!queue_id)
				throw new Error('INVALID_FORMAT');
			if (!this.#lobby.has(queue_id))
				throw new Error('QUEUE_NOT_FOUND');

			this.#clients.delete(ws);
			this.#lobby.delete(queue_id);
			client.send({
				type: 'EXITED',
			});
			ws.close();

		} catch (error) {
			console.error('Server.#exit: Error processing exit:', error.message);
			client.send({
				type: 'ERROR',
				message: error.message
			});
		}
	}

	#onConnect({email, id, name, game_type}, ws) {
		try {
			if (![email, id, name, game_type].every(Boolean)
				|| !['RANKED', 'TOURNAMENT'].includes(game_type))
				throw new Error('INVALID_FORMAT');
	
			const client = new Client({ws, email, id, name});
			const queue_id = crypto.randomUUID();
			this.#clients.set(ws, client);
			this.#lobby.set(queue_id, { owner: client, game_type});
			client.send({
				type: 'CONNECTED',
				queue_id,
			});	
		} catch (error) {
			console.error('Server.#onConnect: Error processing connection:', error.message);
			ws.send(JSON.stringify({
				type: 'ERROR',
				message: error.message
			}));
		}
	}

	#invite(req, reply) {
		if (!req.body || !req.body.queue_id)
			return reply.code(400).send({ type: "ERROR", reason: 'INVALID_FORMAT' });

		const { queue_id } = req.body;

		const lobby = this.#lobby.get(queue_id);
		if (!lobby)
			return reply.code(404).send({ type: "ERROR", reason: 'LOBBY_NOT_FOUND' });

		const host = process.env.HOSTNAME || 'localhost';
		const link = `https://${host}/lobby?id=` + queue_id;
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
