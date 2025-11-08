import fastify from 'fastify';
import dotenv from 'dotenv';
import { mkdir } from 'node:fs/promises';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

dotenv.config();

let db = null;

try {
	await mkdir("./database", { recursive: true });
	db = await open ({
		filename: './database/database.db',
		driver: sqlite3.Database
	});

	await db.exec(`
		CREATE TABLE IF NOT EXISTS auth (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			nickname TEXT UNIQUE NOT NULL,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL
		);
	`);

	console.log("Database and its folder created successfully");
} catch (err) {
	console.error("Error creating the Database or its folder");
	process.exit(1);
}

const PORT = process.env.PORT || 3002;

const app = fastify();

app.get("/hello", (req, reply) => {
	return reply.send("The sqlite-db is working perfectly");
});

await app.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`sqlite-db container is listening on sqlite-db:${PORT}`);
});
