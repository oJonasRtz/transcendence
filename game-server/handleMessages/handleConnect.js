import { addClient } from "../creates/addClient.js";
import { closeCodes } from "../server.shared.js";

export function handleConnect(ws, data) {
	try {
		const playerData = addClient(ws, data);
		
		ws.player = {
			slot: playerData.id,
			matchIndex: playerData.matchIndex,
		}
	} catch (error) {
		console.error("Error adding client:", error.message);
		ws.close(closeCodes.INTERNAL_ERROR, "Error adding client");
	}
}
