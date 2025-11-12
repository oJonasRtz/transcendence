import { identity } from "../../globals";
import { socket } from "../connect";

const INTERVAL: number = 1000;
let ping: number | null = null;
let tsLastPing: number = 0;

export function getLatency() {
	if (ping) return;

	ping = setInterval(() => {
		tsLastPing = Date.now();
		if (socket)
			socket.send(JSON.stringify({ type: "PING", id: identity.id, matchId: identity.matchId }));
	}, INTERVAL);
}

export function calculateLatency(): number {
	return Date.now() - tsLastPing;
}

export function stopGettingLatency() {
	if (ping) {
		clearInterval(ping);
		ping = null;
	}
}
