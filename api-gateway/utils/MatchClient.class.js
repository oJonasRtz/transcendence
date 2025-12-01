import WebSocket from 'ws';

class MatchClient {
	#ws = null;
	#messages = [];
	constructor(url) {
		this.#ws = new WebSocket(url);
		console.log("MatchClient: Connecting to ", url);
		this.#ws.on('open', () => {
			console.log("MatchClient: Connected to match-service");

			this.#ws.on('message', (data) => {
				this.#messages.push(data.toString());
			});
		});
	}

	send(data) {
		if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN)
			return;
		this.#ws.send(JSON.stringify(data));
	}

	get messages() {
		return this.#messages;
	}
}

export default new MatchClient('ws://match-service:3004/ws');
