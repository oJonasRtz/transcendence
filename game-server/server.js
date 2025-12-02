import { WebSocketServer } from "ws";
import { lobby, matches } from "./server.shared.js";
import { handleTypes } from "./controllers/handleTypes.js";
import 'dotenv/config';
import { ddosDetect, removeConnection } from './controllers/ddosDetector.js';

//port 8443 for tests with wss, change to 443  for production
//.env nao esta funcionando ainda verificar futuramente
const PORT = process.env.PORT || 8443;
const HOST = "0.0.0.0";
const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on("connection", (ws) => {
	ws.player = null;
	const ip = ws._socket.remoteAddress;
	if (ddosDetect(ip)) {
		ws.close();
		return;
	}
	ws.on("message", (message) => {
		const data = JSON.parse(message);

		handleTypes(ws, data);
	})

	ws.on("error", (error) => {
		console.error("WebSocket error:", error);
	});

	ws.on("close", () => {
		const ip = ws._socket.remoteAddress;
		removeConnection(ip);

		if (lobby.isConnected(ws)) {
			lobby.disconnect();
			return;
		}

		console.log("Connection closed");

		if (!matches) return;
		try {
			const match = matches[ws.player?.matchIndex];
			if (match)
				match.disconnectPlayer(ws.player?.slot);
			ws.player = null;
		}
		catch (error) {
			console.error("Error during disconnection:", error.message);
		}
	});
});
