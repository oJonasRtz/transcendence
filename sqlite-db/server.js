import fastify from 'fastify';
import dotenv from 'dotenv';
import sqlite from 'sqlite';

dotenv.config();

const PORT = process.env.PORT || 3002;

const app = fastify();

app.get("/hello", () => {
	console.log("Hello from sqlite-db");
});

app.listen(PORT, () => {
	console.log(`sqlite-db container is listening on sqlite-db:${PORT}`);
});
