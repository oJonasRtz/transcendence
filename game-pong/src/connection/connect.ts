import { gameState, identity, RECONNECTION__DELAY } from "../globals";
import { checkKeys } from "./checkKeys";
import { handleType } from "./handlers/handleType";
import { getLatency, stopGettingLatency } from "./utils/getLatency";

export let socket: WebSocket | null = null;

export function connectPlayer(): void {
	const serverIp = "localhost";
	socket = new WebSocket(`wss://${serverIp}:8443`);

	socket.onopen = () => {
		console.log('Connected to WebSocket server');
		socket?.send(JSON.stringify({type: "CONNECT_PLAYER", matchId: identity.matchId, name: identity.name, id: identity.id, playerId: identity.playerId}));
		gameState.connected = true;
		getLatency();
	}

	checkKeys(socket);

	socket.onmessage = (event) => {
		const data = JSON.parse(event.data);

		console.log('Message from server:', {data});

		handleType(data);
	}

	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
		gameState.connected = false;
	}

	socket.onclose = (event) => {
		if (gameState.gameEnd) return;

		//Reconnection
		gameState.connected = false;
		console.log(`Disconnected from WebSocket server: ${event.reason}`);
		console.log(`Trying to reconnect in ${RECONNECTION__DELAY / 1000} seconds...`);
		setTimeout(connectPlayer, RECONNECTION__DELAY);
	}
}

export function disconnectPlayer(reason: string): void {
	if (!socket) return;

	stopGettingLatency();
	console.log(`[disconnectPlayer] Disconnecting from server: ${reason}`);
	socket.close(1000, reason);
	socket = null;
	gameState.connected = false;
}
