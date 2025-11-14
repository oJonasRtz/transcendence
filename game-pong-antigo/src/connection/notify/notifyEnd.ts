import { identity } from "../../globals";
import { socket } from "../connect";

export function notifyEnd(winner: string): void {
	if (!socket) return;

	console.log(`[notifyEnd] Sending endGame notification: ${winner}`);
	socket.send(JSON.stringify({type: "endGame", winner, matchId: identity.matchId, id: identity.id}));
}
