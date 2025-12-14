export class Client {
	#info = {
		id,
		name,
	};
	#ws;
	#email;
	#rank;
	#sendBuffer = [];

	constructor ({ws, email, id, name}) {
		this.#ws = ws;
		this.#email = email;
		this.#info.id = id;
		this.#info.name = name;

		this.#ws.on('open', () => {
			this.#flushPending();
		});

		this.#ws.on('close', () => {
			console.log(`Client ${this.#email} disconnected.`);
		});
	}

	get info() {
		return {...this.#info};
	}

	send(data) {
		if (!data)
			return;
		if (this.#ws.readyState !== this.#ws.OPEN)
			return this.#sendBuffer.push(data);

		this.#ws.send(JSON.stringify(data));
	}

	#flushPending() {
		while (this.#sendBuffer.length > 0 && this.#ws.readyState === this.#ws.OPEN) {
			const message = this.#sendBuffer.shift();
			this.send(message);
		}
	}
}
