import { WebSocketServer } from "ws";
import { lobby, matches } from "./server.shared.js";
import { handleTypes } from "./controllers/handleTypes.js";
import 'dotenv/config';
import { ddosDetect, removeConnection } from './controllers/ddosDetector.js';
import fs from 'fs';
import https from 'https';

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PORT = process.env.PORT || 8443;
const HOST = "0.0.0.0";

const tls = {
	key: fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.cert')
}
const server = https.createServer(tls);

const wss = new WebSocketServer({ server});

server.listen(PORT, HOST, () => {
	console.log(`WebSocket server is running on wss://${HOST}:${PORT}`);
});

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
