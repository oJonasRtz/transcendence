import {app, con } from "./app.js";

const PORT = 3004;

try {
    await app.listen({ port: PORT, host: "0.0.0.0"});
    console.log(`The match-service is listening on port ${PORT}`);
} catch (error) {
    console.error("Error starting the match-service:", error);
    process.exit(1);
}

//Connect to game server
con.connect();

process.on("uncaughtException", (exception) => {
    console.error("Unhandled Exception:", exception);
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
});

app.server.on('close', () => {
    console.log('Fastify server closed');
});