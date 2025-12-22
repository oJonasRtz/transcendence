import fastify from "fastify";
import cookie from "@fastify/cookie";
import fastifyWebsocket from "@fastify/websocket";
import formbody from "@fastify/formbody";
import { Client } from "./Client.class.js";

export class Server {
	#app = fastify();
	// #myRoutes = [
	// 	{ method: 'POST', url: '/invite', handler: this.#invite.bind(this) },
	// 	{ method: 'GET', url: '/get_tournaments', handler: this.#getTournaments.bind(this) },
	// 	{ method: 'POST', url: '/create_tournament', handler: this.#setTournament.bind(this) },
	// ];
	#clients = new Map(); // <id, Client>
	#handlers = {
		'CONNECT': ({email, id, name}, ws) => this.#addClient({email, id, name}, ws),
	}

	constructor() {
		this.#app.register(formbody);
		this.#app.register(cookie);
		this.#app.register(fastifyWebsocket);

		this.#app.register(async (app) => {
			app.get('/', { websocket: true }, (socket /* SocketStream */, req /* FastifyRequest */) => {
				socket.on('message', (message) => {
					try {
						const raw = message.toString().trim();
						if (!raw)
							return;

						const data = JSON.parse(raw);
						console.log('Received message:', data);

						this.#handleMessages({data, ws: socket});
					} catch (error) {
						console.error('Server: Error parsing message:', error.message);
					}
				});
			});
		});

		// this.#routes_def();
	}
	// #routes_def() {
	// 	for (const route of this.#myRoutes)
	// 		this.#app.route(route);
	// }

	// #setTournament(req, reply) {
		
	// }

	// #getTournaments(req, reply) {

	// 	//Formato de retorno
	// 	// {
	// 	// 	type: NEXT_TOURNAMENT,
	// 	// 	date: "2025-12-10, 10:30:00",
	// 	// 	name: "Grande torneio da sua vida"
	// 	//   }
	// }

	#handleMessages({data, ws}) {
		try {
			const {type} = data;

			console.log('Server.#handleMessages: Handling message of type:', type);
			if (!type || !(type in this.#handlers))
				throw new Error('INVALID_FORMAT');

			console.log("passei aqui");
			if (type === 'CONNECT') {
				this.#handlers[type](data, ws);
				return;
			}
			const client = this.#clients.get(data.id);
			if (!client)
				throw new Error('NOT_CONNECTED');

			this.#handlers[type](data, client);
		} catch (error) {
			console.error('Server.#handleMessages: Error handling message:', error.message);
			const message = {
				type: 'ERROR',
				reason: error.message
			}
			ws.send(JSON.stringify(message));
		}
	}

	#addClient({email, id, name}, ws) {
		console.log("chegamos na addClient");
		if (![email, id, name, ws].every(Boolean))
			throw new Error('A');

		console.log("criando novo client");
		const c = new Client({ws, email, id, name});
		this.#clients.set(id, c);
	}

	listen(port = 3020) {
		if (!port)
			port = 3020;

		this.#app.listen({port, host: "0.0.0.0"}, (err) => {
			if (err) {
				console.error('Server.listen: Error starting server:', err);
				process.exit(1);
			}
			console.log(`Server.listen: Server listening on port ${port}`);
		})
	}
}
