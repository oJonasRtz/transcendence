import fastify from 'fastify';
import dotenv from 'dotenv';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

dotenv.config();

const PORT = process.env.PORT || 3002;

const app = fastify();

app.get("/hello", (req, reply) => {
	return reply.send("The sqlite-db is working perfectly");
});

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`sqlite-db container is listening on sqlite-db:${PORT}`);
});
