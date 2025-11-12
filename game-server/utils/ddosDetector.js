import { lobby, types } from "../server.shared.js";

const connectionsPerIp = new Map();
const MAX_CONNECTIONS = 10;

export function ddosDetect(ip) {
	const count = connectionsPerIp.get(ip) || 0;
	if (count >= MAX_CONNECTIONS) {
		lobby.send({
			type: types.message.ERROR,
			error: types.error.TOO_MANY_CONNECTIONS,
			ip,
		})
		return true;
	}
	connectionsPerIp.set(ip, count + 1);
	return false;
}

export function removeConnection(ip) {
	const count = connectionsPerIp.get(ip) || 0;
	if (count <= 1) {
		connectionsPerIp.delete(ip);
		return;
	}
	connectionsPerIp.set(ip, count - 1);
}
