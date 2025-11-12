import app from './app.js';

const PORT = process.env.PORT || 3001;

try {
	await app.listen({ port: PORT, host: "0.0.0.0" });
	console.log(`The auth-service is listening on auth-service:${PORT} port`);
} catch (err) {
	console.error("Failed initialized auth-service:", err);
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
