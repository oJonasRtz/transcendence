import readline from 'readline';
import fs from 'fs';
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export let socket = null;
const ID = 4002;
let matchId = [];

function remove(id) {
	console.log("Removing match with ID:", id);
	socket?.send(JSON.stringify({id: ID, type: "REMOVE_MATCH", matchId: id}));
}

function prompt() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.setPrompt("<Backend>$ ");
	rl.prompt();
	rl.on('line', (line) => {
		switch (line.trim()) {
			case 'newMatch':
				socket?.send(JSON.stringify({id: ID, type: "NEW_MATCH", players: {
					1: {name: "Raltz", id: 4002},
					2: {name: "Kirlia", id: 8922}
					},
					maxPlayers: 2
				}));
				break;
			case 'removeMatch':
				const id = matchId.pop();
				remove(id);
				break;
		}
		rl.prompt();
	}).on('close', () => {
		console.log('Exiting backend test client.');
		process.exit(0);
	});
}

export function connect() {
	const url = "wss://localhost:8443";
	socket = new WebSocket(url);

	socket.onopen = () => {
		console.log('Connected to WebSocket server');
		socket?.send(JSON.stringify({type: "CONNECT_LOBBY", pass: "Azarath Metrion Zinthos", id: ID}));
		prompt();
	}
	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		console.log('Message from server:', {data});
		if (data.type === "MATCH_CREATED") {
			console.log("New match created with ID:", data.matchId);
			matchId.push(data.matchId);
		}
		if (data.type === "ERROR")
			switch(data.error) {
				case "DUPLICATE":
					console.log("Duplicate connection detected.");
					remove(data.matchId);
					break;
			}
	}

	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
	}

	socket.onclose = (event) => {
		console.log('WebSocket connection closed:', event);
		
		setTimeout(connect, 5000);
	}
}

connect();
