import { Lobby } from "./Lobby.class";

export class Queue {
	#room = new Map() //  <queue_id, Lobby>

	constructor () {
		this.#matchMaking();
	}

	addRoom({owner, game_type, state}) {
		try {
			const room_id = crypto.randomUUID();
			const lobby = new Lobby({type: game_type, state, owner, id: room_id});

			this.#room.set(room_id, lobby);
		} catch (error) {
			console.error('Queue.addRoom: Error adding room:', error.message);
			throw new error.message;
		}
	}

	joinRoom({queue_id, client}) {
		try {
			if (!this.#room.has(queue_id))
				throw new Error('ROOM_NOT_FOUND');

			const lobby = this.#room.get(queue_id);
			lobby.addClient(client);
		} catch (error) {
			console.error('Queue.joinRoom: Error joining room:', error.message);
		}
	}

	#matchMaking() {
		// setInterval(() => {});
	}

	createInvite(queue_id) {
		if (!this.#room.has(queue_id))
			throw new Error('ROOM_NOT_FOUND');

		const host = process.env.HOST || 'localhost';
		
		return `https://${host}/lobby?i=${queue_id}`;
	}
}
