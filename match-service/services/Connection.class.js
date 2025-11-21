import fs from 'fs';

export class Connection {
	#socket = null;
	#ca = fs.readFileSync('../ssl/rootCA.pem');
	#server = {
		ip: process.env.IP,
		port: process.env.PORT,
	};
	#reconnection = {
		delay: 5000,
		canReconnect: true,
	}
	
	connect() {
		this.#reconnection.canReconnect = true;
		this.#socket = new WebSocket(`wss://${this.#server.ip}:${this.#server.port}`, {
			ca: this.#ca
		});

		this.#socket.onopen = () => {
			console.log("Connection.connect: Connected to server");
		};

		this.#socket.onerror = (error) => {
			console.error("Connection.connect: WebSocket error:", error.message);
			this.#reconnect();
		};
		this.#socket.onclose = (event) => {
			console.log(`Connection.connect: Disconnected from server (code: ${event.code})`);

			this.#reconnect();
		};
	}

	#reconnect() {
		if (!this.#reconnection.canReconnect
			|| !this.#socket
			|| this.#socket.readyState === WebSocket.CONNECTING
			|| this.#socket.readyState === WebSocket.OPEN)
			return;

		setTimeout(() => {
			console.log("Connection.#reconnect: Attempting to reconnect...");
			this.connect();
		}, this.#reconnection.delay);
	}

	disconnect() {
		if (!this.#socket)
			return;

		this.#reconnection.canReconnect = false;
		this.#socket.close();
	}
}
