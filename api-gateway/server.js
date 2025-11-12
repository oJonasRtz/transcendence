import app from './app.js';
import axios from 'axios';

const PORT = process.env.PORT || 3000;

try {
	await app.listen({ port: PORT, host: "0.0.0.0" });
	console.log(`Api-gateway is running on api-gateway:${PORT} port`);
} catch (err) {
	console.error("Error initializing the gateway:", err);
}

process.on("uncaughtException", (exception) => {
	console.error("Unhandled Exception:", exception);
});

process.on("unhandledRejection", (reason) => {
	console.error("Unhandled rejection:", reason);
});

app.server.on('close', () => {
	console.log('Fastify server closed');
});
