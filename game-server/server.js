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

function collectPongStats() {
	const liveMatches = Object.values(matches ?? {});

	let playersConnected = 0;
	let playersPlaying = 0;
	let matchesWaitingPlayers = 0;
	let matchesWaitingReady = 0;
	let matchesPlaying = 0;

	for (const match of liveMatches) {
		const connectedPlayersCount = Number(match?.connectedPlayersCount) || 0;
		const gameStarted = Boolean(match?.gameStarted);
		const gameEnded = Boolean(match?.gameEnded);
		const allConnected = Boolean(match?.allconnected);

		playersConnected += connectedPlayersCount;
		if (gameEnded) continue;

		if (gameStarted) {
			matchesPlaying += 1;
			playersPlaying += connectedPlayersCount;
			continue;
		}

		if (allConnected) matchesWaitingReady += 1;
		else matchesWaitingPlayers += 1;
	}

	return {
		playersConnected,
		playersPlaying,
		matchesTotal: liveMatches.length,
		matchesWaitingPlayers,
		matchesWaitingReady,
		matchesPlaying
	};
}

server.on("request", (req, res) => {
	if (req.method === "GET" && req.url && req.url.startsWith("/metrics")) {
		metrics.setPongStats(collectPongStats());
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

function getClientIp(ws, request) {
	const forwardedFor = request?.headers?.["x-forwarded-for"];
	if (typeof forwardedFor === "string" && forwardedFor.trim() !== "") {
		const [firstIp] = forwardedFor.split(",");
		if (firstIp && firstIp.trim() !== "") return firstIp.trim();
	}

	const realIp = request?.headers?.["x-real-ip"];
	if (typeof realIp === "string" && realIp.trim() !== "")
		return realIp.trim();

	return request?.socket?.remoteAddress || ws?._socket?.remoteAddress || "unknown";
}

wss.on("connection", (ws, request) => {
	metrics.wsConnections.inc(metrics.defaultLabels, 1);
	ws.player = null;
	const ip = getClientIp(ws, request);
	ws.clientIp = ip;
	if (ddosDetect(ip)) {
		ws.close(1008, "Too many connections from this IP");
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
		const ip = ws.clientIp || "unknown";
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
