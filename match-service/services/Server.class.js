import fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import { Client } from './Client.class.js';
import { lobby } from '../app.js';

export class Server {
	#invites = new Map();
	#usersInvited = new Map();
	#app = fastify();
	#queue = new Map(); // <-- key[email] = Client
	#services = {
		ENQUEUE: this.#enqueue.bind(this),
		DEQUEUE: this.#dequeue.bind(this),
	}
	#routes = [
		{ method: 'POST', url: '/invite', handler: this.#sendInvite.bind(this) },
		{ method: 'POST', url: '/accept-invite', handler: this.#acceptInvite.bind(this) },
	];
	#intervalMatchMaking = null;

	constructor() {
		this.#app.register(cookie, {
			secret: process.env.COOKIE_SECRET || 'purpleVoid',
			hook: 'onRequest'
		});

		this.#app.register(formbody);
		this.#app.register(fastifyWebsocket);

		this.#app.get('/', { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
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
		
		this.#routes_def();
		this.#matchMaking();
		this.#checkInviteValidity();
	}

	#checkInviteValidity() {
		const INVITE_VALIDITY = 1000 * 60; // 1 minute

		setInterval(() => {
			if (this.#invites.size === 0)
				return;

			const now = Date.now();
			for (const invite of this.#invites.values()) {
				if (now - invite.timestamp > INVITE_VALIDITY) {
					console.log(`Invite ${invite.inviteId} expired.`);
					this.#invites.delete(invite.inviteId);
					this.#usersInvited.delete(invite.public_id);
				}
			}
		}, INVITE_VALIDITY);
	} 

	#sendInvite(req, reply) {
		if (!req.body || !req.body.public_id || !req.body.userName)
			return reply.status(400).send({ error: 'INVALID_FORMAT' });
		

		const {public_id, userName} = req.body;
		
		if (this.#usersInvited.has(public_id))
			return reply.status(400).send({ error: 'WAIT_TO_INVITE_AGAIN' });

		const inviteId = crypto.randomUUID();

		this.#usersInvited.set(public_id, inviteId);
		this.#invites.set(inviteId, {
			inviteId,
			public_id,
			userName,
			timestamp: Date.now(),
		})

		const link = 'http://match-service:3004/accept-invite?inviteId=' + inviteId;

		return reply.status(200).send({ link });
	}
	#acceptInvite(req, reply) {
		const inviteId = req.query.inviteId;
		const { public_id, userName } = req.body;

		if (!inviteId || !public_id || !userName)
			return reply.status(400).send({ error: 'INVALID_FORMAT' });

		if (!this.#invites.has(inviteId))
			return reply.status(400).send({ error: 'INVALID_INVITE' });

		const invite = this.#invites.get(inviteId);

		if (invite.public_id === public_id)
			return reply.status(400).send({ error: 'CANNOT_INVITE_YOURSELF' });

		//create a new match with both users
		const matchId = 42; 

		const match = {
			type: 'INVITE_ACCEPTED',
			id: matchId,
			inviteId,
			players: {
				[invite.public_id]: { userName: invite.userName },
				[public_id]: { userName },
			}
		};

		this.#invites.delete(inviteId);
		this.#usersInvited.delete(invite.public_id);

		return reply.status(200).send( match );
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

	#routes_def() {
		for (const route of this.#routes)
			this.#app.route(route);
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

		console.log(`Client ${email} enqueued for matchmaking.`);
	}

	#dequeue({email}) {
		if (!this.#queue.has(email))
			return;

		this.#queue.get(email).destroy();
		this.#queue.delete(email);
		console.log(`Client ${email} dequeued from matchmaking.`);
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
