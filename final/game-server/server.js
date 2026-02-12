import { WebSocketServer } from "ws";
import { lobby, matches } from "./server.shared.js";
import { handleTypes } from "./controllers/handleTypes.js";
import 'dotenv/config';
import { ddosDetect, removeConnection } from './controllers/ddosDetector.js';
import fs from 'fs';
import https from 'https';
import { createGameServerMetrics } from "./metrics/prometheus.js";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PORT = process.env.PORT || 8443;
const HOST = "0.0.0.0";

const tls = {
	key: fs.readFileSync('./ssl/server.key'),
	cert: fs.readFileSync('./ssl/server.cert')
}
const server = https.createServer(tls);

const metrics = createGameServerMetrics({ serviceName: "game-server" });
server.on("request", (req, res) => {
	if (req.method === "GET" && req.url && req.url.startsWith("/metrics")) {
		res.writeHead(200, { "content-type": metrics.contentType });
		res.end(metrics.render());
		return;
	}
	res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
	res.end("not found\n");
});

const wss = new WebSocketServer({ server});

server.listen(PORT, HOST, () => {
	console.log(`WebSocket server is running on wss://${HOST}:${PORT}`);
});

wss.on("connection", (ws) => {
	metrics.wsConnections.inc(metrics.defaultLabels, 1);
	ws.player = null;
	const ip = ws._socket.remoteAddress;
	if (ddosDetect(ip)) {
		ws.close();
		return;
	}
	ws.on("message", (message) => {
		metrics.wsMessagesReceivedTotal.inc(metrics.defaultLabels, 1);
		const data = JSON.parse(message);

		handleTypes(ws, data);
	})

	ws.on("error", (error) => {
		console.error("WebSocket error:", error);
	});

	ws.on("close", () => {
		metrics.wsConnections.dec(metrics.defaultLabels, 1);
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
