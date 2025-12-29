import fastify from "fastify";
import cookie from "@fastify/cookie";
import fastifyWebsocket from "@fastify/websocket";
import formbody from "@fastify/formbody";
import { Client } from "./Client.class.js";
import crypto from "crypto";
import { Party } from "./Party.class.js";

export class Server {
	#app = fastify();
	#myRoutes = [
		{ method: 'POST', url: '/invite', handler: this.#invite.bind(this) },
		{ method: 'POST', url: '/join_party/:token', handler: this.#joinParty.bind(this) },
		{ method: 'POST', url: '/leave_party', handler: this.#leaveParty.bind(this) },
		{ method: 'GET', url: '/party', handler: this.#getParty.bind(this) },
		// { method: 'GET', url: '/get_tournaments', handler: this.#getTournaments.bind(this) },
		// { method: 'POST', url: '/create_tournament', handler: this.#setTournament.bind(this) },
	];

	#wsToClient = new Map() // <ws, Client>
	#clients = new Map(); // <id, Client>
	#invitesValidityTime = (1000 * 60) * 5 // 5 minutes
	#invites = new Map(); // <token, group: {owner(client), createdAt, members: Set(), size: members.lenght + 1, game_type}>
	#invitesOwners = new Set(); // Set<client>
	#handlers = {
		'CONNECT': ({email, id, name}, ws) => this.#addClient({email, id, name}, ws),
		'ENQUEUE': (data, client) => client.handleActions(data),
		'DEQUEUE': (data, client) => client.handleActions(data),
		'INVITE': (data, client) => client.handleActions(data),
		'EXIT': (data, client) => client.handleActions(data),
	}

	constructor() {
		this.#app.register(formbody);
		this.#app.register(cookie, {
			secret: process.env.COOKIE_SECRET || 'purpleVoidSatoroGojopurpleVoidSatoroGojo',
			hook: 'onRequest'
		});
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

				socket.on('close', () => {
					const client = this.#wsToClient.get(socket);
					if (!client) return;

					this.#wsToClient.delete(socket);
				});
			});
		});

		this.#routes_def();
		this.#checkInvitesValidity();
	}

	#routes_def() {
		for (const route of this.#myRoutes)
			this.#app.route(route);
	}

	createSoloParty({id, game_type}) {
		if (!id
			|| !game_type
			|| !['RANKED', 'TOURNAMENT'].includes(game_type))
			throw new Error('INVALID_PARAM');
		
		try {
			const client = this.#clients.get(id);
			if (!client)
				throw new Error('CLIENT_NOT_CONNECTED');
			const token = crypto.randomBytes(16).toString('hex');
			const party = new Party({token, game_type});
			party.addClient(client, true);
			return party;
		} catch (error) {}
	}

	#getParty(req, reply) {
		try {
			const {id} = req.body;

			if (!id)
				throw new Error('INVALID_FORMAT');

			const client = this.#clients.get(id);
			if (!client)
				throw new Error('NOT_CONNECTED');

			const party = client.party;
			if (!party)
				throw new Error('NOT_IN_PARTY');

			const leader = party.leader;
			const partyInfo = {
				game_type: party.game_type,
				clients: [...party.clients].map(c => ({
					id: c.id,
					name: c.name,
					rank: c.rank,
					isLeader: c === leader,
				})),
			};

			return reply.status(200).send({type: 'PARTY_INFO', party: partyInfo, code: 200});
		} catch (error) {
			console.error('Server.#getParty: Error getting party info:', error.message);
			return reply.status(400).send({type: 'ERROR', reason: error.message, code: 400});
		}
	}

	//#region Invites
	async #invite(req, reply) {
		try {
			const {id, game_type} = req.body;
			if (!id || !game_type || !['RANKED', 'TOURNAMENT'].includes(game_type))
				throw new Error('INVALID_FORMAT');
			
			const client = this.#clients.get(id);
			if (!client)
				throw new Error('NOT_CONNECTED');

			if (this.#invitesOwners.has(client))
				throw new Error('CANNOT_INVITE_YET');

			await client.handleActions({type: 'INVITE'});
			let party = client.party;
			if (!party || party.game_type !== game_type) {
				party = this.createSoloParty({id: client.id, game_type});
			}
			party.createdByInvite = true;
			const token = party.token;
			const ip = process.env.PUBLIC_IP || 'localhost';
			const link = `https://${ip}/match/join_party/` + token;

			this.#invites.set(token, {owner: client, createdAt: Date.now(), game_type, party});
			this.#invitesOwners.add(client);

			return reply.status(200).send({type: 'INVITE_CREATED', link, code: 200});
		} catch (error) {
			console.error('Server.#invite: Error handling invite:', error.message);
			return reply.status(400).send({type: 'ERROR', reason: error.message, code: 400});
		}
	}

	//get req.user.user_id from req(API-Gateway)
	#joinParty(req, reply) {
		try {
			const {token} = req.params;
			const {id} = req.body;

			if (!token || !id)
				throw new Error('INVALID_FORMAT');

			const client = this.#clients.get(id);
			if (!client)
				throw new Error('NOT_CONNECTED');

			const invite = this.#invites.get(token);
			if (!invite)
				throw new Error('INVALID_INVITE');

			if (this.#checkInvite(invite, token))
				throw new Error('INVITE_EXPIRED');

			const party = invite.party;

			party.addClient(client);
			return reply.status(200).send({type: 'JOINED_PARTY', code: 200});
		} catch (error) {
			console.error('Server.#handleInviteLink: Error handling invite link:', error.message);
			return reply.status(400).send({type: 'ERROR', reason: error.message, code: 400});
		}
	}

	#leaveParty(req, reply) {
		try {
			const {id} = req.body;

			if (!id)
				throw new Error('INVALID_FORMAT');

			const client = this.#clients.get(id);
			if (!client)
				throw new Error('NOT_CONNECTED');

			const party = client.party;
			if (!party)
				throw new Error('NOT_IN_PARTY');

			party.removeClient(client);
			return reply.status(200).send({type: 'LEFT_PARTY', code: 200});
		} catch (error) {
			console.error('Server.#leaveParty: Error leaving party:', error.message);
			return reply.status(400).send({type: 'ERROR', reason: error.message, code: 400});
		}
	}

	#checkInvite({owner, createdAt}, token) {
		if (Date.now() - createdAt <= this.#invitesValidityTime)
			return false;

		this.#invites.delete(token);
		this.#invitesOwners.delete(owner);
		owner.send({
			type: 'INVITE_EXPIRED',
			code: 200,
		});
		return true;
	}

	#checkInvitesValidity() {
		setInterval(() => {
			if (this.#invites.size === 0 && this.#invitesOwners.size === 0)
				return;

			const now = Date.now();
			this.#invites.forEach(({owner, createdAt}, token) => {
				this.#checkInvite({owner, createdAt}, token);
			});
		}, 60000);
	}
	//#endregion

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

	removeClient(id) {
		try {
			const client = this.#clients.get(id);
			if (!client)
				throw new Error('CLIENT_NOT_FOUND');

			const party = client.party;
			if (party)
				party.removeClient(client);

			this.#clients.delete(id);
			console.log(`Server.removeClient: Client removed: ${client.name} (${id})`);
		} catch (error) {
			console.error('Server.removeClient: Error removing client:', error.message);
		}
	}

	//#region Messages
	//Client need to send id every request
	#handleMessages({data, ws}) {
		try {
			const {type} = data;

			if (!type || (!(type in this.#handlers)))
				throw new Error('INVALID_FORMAT');

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
				reason: error.message,
				code: 400,
			}
			ws.send(JSON.stringify(message));
		}
	}

	#addClient({email, id, name}, ws) {
		try {
			if (![email, id, name].every(Boolean))
				throw new Error('INVALID_FORMAT');

			if (this.#wsToClient.has(ws))
				throw new Error('ALREADY_CONNECTED');

			let c = this.#clients.get(id);
			if (c && c.isConnected())
				throw new Error('ALREADY_CONNECTED');

			if (c) {
				c.reconnect(ws);
				console.log(`Server.#addClient: Client reconnected: ${name} (${id})`);
			}
			else {
				c = new Client({ws, email, id, name});
				this.#clients.set(id, c);
				console.log(`Server.#addClient: New client connected: ${name} (${id})`);
			}

			this.#wsToClient.set(ws, c);

			c.send({
				type: 'CONNECTED',
				code: 200,
			});
		} catch (error) {
			console.error('Server.#addClient: Error adding client:', error.message);
			const message = {
				type: 'ERROR',
				reason: error.message,
				code: 400,
			}
			ws.send(JSON.stringify(message));
		}
	}
	//#endregion

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
