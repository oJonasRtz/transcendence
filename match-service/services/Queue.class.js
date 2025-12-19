import { WebSocketServer } from "ws";
import { Client } from "./Client.class.js";

/*
	Queue[queueId]{
		type: 'RANKED' | 'TOURNAMENT',
		clients: Map<clientId, Client>
	}

	- queueId vai ficar no link no front
		- https://site.com/match?id=queueId
	- o id do link sera usado para convites

	ideia de torneio
	- fechar pelo menos 4 times
	- organizar chaves
	- vencedor joga com vencedor
	- cada um joga pelo menos 2x

	[0] x [1] === [2] x [3]
	 vencedor(0,1) x vencedor(2,3) === final(1º e 2º lugar)
	 perdedor(0,1) x perdedor(2,3) === repescagem(3º e 4º lugar)
*/

class Lobby {
	#clients = new Map();
	#id;
	#type;
	#clientsLimit = 2;

	constructor({id, type, owner}) {
		if (!(owner instanceof Client)
				|| !type
				|| !['RANKED', 'TOURNAMENT'].includes(type))
			throw new Error('INVALID_FORMAT');

		this.#id = id;
		this.#type = type;
		this.addClient(owner);
	}

	addClient(client) {
		if (this.isFull())
			throw new Error('LOBBY_FULL');

		this.#clients.set(client.id, client);
	}

	isClientInLobby(clientId) {
		return this.#clients.has(clientId);
	}

	isFull() {
		return this.#clients.size === this.#clientsLimit;
	}

	get type() {
		return this.#type;
	}

	get id() {
		return this.#id;
	}

	get rank() {
		const avg = Object.values(this.#clients).reduce((acc, client) => acc + client.rank, 0) / this.#clients.size;
		return avg;
	}
}

export class Queue {
	#queue = new Map(); //<queueId, Lobby>
	#ws = null;
	#port = 3010;
	#matchInterval = null;
	#routes = {
		ENQUEUE: this.#enqueue.bind(this),
		DEQUEUE: this.#dequeue.bind(this),
	};

	constructor() {
		this.#ws = new WebSocketServer({ port: this.#port, host: '0.0.0.0' });

		this.#ws.on('connection', (socket) => {
			console.log('New client connected to the queue service.');

			socket.on('message', (message) => {
				const data = JSON.parse(message);
				try {
					const {email, public_id, userName, type} = data;
					if (!type || !(type in this.#routes))
						throw new Error('INVALID_FORMAT');

					const r = this.#routes[type]({
						ws: socket,
						email: email,
						id: public_id,
						name: userName
					});

					if (r === 1)
						throw new Error('INVALID_FORMAT');
				} catch (error) {
					socket.send(JSON.stringify({
						type: 'ERROR',
						message: error.message
					}));
					return;
				}
			});

			socket.on('close', () => {
				console.log('Client disconnected from the queue service.');
			});
		});

		this.#matchMaking();
	}

	#matchMaking() {
		if (this.#matchInterval)
			return;

		const TIMER = 3000; // 3 seconds

		this.#matchInterval = setInterval(() => {
			const queueSize = this.#queue.size;
			if (queueSize < 2)
				return;

			const queue = Array.from(this.#queue.values());
			for (let i = 0; i < Math.floor(queueSize / 2); i++) {
				const clientA = queue[i * 2];
				const clientB = queue[i * 2 + 1];

				if (!clientA || !clientB || !clientA.checkRank(clientB.rank))
					continue;

				// Match found
				const matchId = 42;

				clientA.matchFound(matchId);
				clientB.matchFound(matchId);
				this.#queue.delete(clientA.id);
				this.#queue.delete(clientB.id);
			}
		}, TIMER);
	}

	#enqueue({ws, email, id, name, queueType}) {
		if (![ws, email, id].every(Boolean))
			return 1;

		if (Object.values(this.#queue).some(l => l.isClientInLobby(id)))
			return;

		// const client = new Client({ws, email, id, name});
		// this.#queue.set(id, client);

		try {
			const client = new Client({ws, email, id, name});
			const id = crypto.randomUUID();
			const lobby = new Lobby({id, type: queueType, owner: client});

			this.#queue.set(id, lobby);
			console.log(`Queue ${id} created with owner ${name} (${email}).`);
		} catch (error) {
			console.error(`Failed to enqueue client ${name} (${email}): ${error.message}`);
			
		}
	}

	#dequeue({id}) {
		if (!id || !this.has(id))
			return;

		this.#queue.get(id).destroy();
		this.#queue.delete(id);

		console.log(`Client ${id} removed from the queue.`);
	}
}
