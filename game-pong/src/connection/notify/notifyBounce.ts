import { identity } from "../../globals";
import { socket } from "../connect";

export function notifyBounce(axis: 'x' | 'y'): void {
	if (!socket) return;

	socket.send(JSON.stringify({
		type: "bounce",
		id: identity.id,
		matchId: identity.matchId,
		axis: axis,
	}));
}
