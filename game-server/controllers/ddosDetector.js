import { lobby, types } from "../server.shared.js";

const connectionsPerIp = new Map();
const DEFAULT_MAX_CONNECTIONS_PER_IP = 200;
const parsedMaxConnections = Number(process.env.MAX_CONNECTIONS_PER_IP);
const MAX_CONNECTIONS =
	Number.isFinite(parsedMaxConnections) && parsedMaxConnections > 0
		? Math.floor(parsedMaxConnections)
		: DEFAULT_MAX_CONNECTIONS_PER_IP;

export function ddosDetect(ip) {
	const ipKey = ip || "unknown";
	const count = connectionsPerIp.get(ipKey) || 0;
	if (count >= MAX_CONNECTIONS) {
		lobby.send({
			type: types.message.ERROR,
			error: types.error.TOO_MANY_CONNECTIONS,
			ip: ipKey,
		})
		return true;
	}
	connectionsPerIp.set(ipKey, count + 1);
	return false;
}

export function removeConnection(ip) {
	const ipKey = ip || "unknown";
	const count = connectionsPerIp.get(ipKey) || 0;
	if (count <= 1) {
		connectionsPerIp.delete(ipKey);
		return;
	}
	connectionsPerIp.set(ipKey, count - 1);
}
