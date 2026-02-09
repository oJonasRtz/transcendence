import app from './app.js';

const PORT = process.env.PORT || 3005;

try {
	await app.listen({ port: PORT, host: "0.0.0.0" });
	console.log(`The chat-service is listening on chat-service:${PORT} port`);
} catch (err) {
	console.error("Failed initialized chat-service:", err);
	process.exit(1);
}

// Event Listeners

process.on("uncaughtException", (exception) => {
        console.error("Unhandled Exception:", exception);
});

process.on("unhandledRejection", (reason) => {
        console.error("Unhandled rejection:", reason);
});

app.server.on('close', () => {
        console.log('Fastify server closed');
});
