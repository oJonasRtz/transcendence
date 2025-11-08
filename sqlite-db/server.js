import app from './app.js';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import databaseRoutes from './routes/databaseRoutes.js';

const PORT = process.env.PORT || 3002;

app.register(databaseRoutes, {});

try {
	await app.listen({ port: PORT, host: "0.0.0.0" });
	console.log(`sqlite-db container is listening on sqlite-db:${PORT}`);
} catch (err) {
	console.error("Error initializing the sqlite-db container:", err);
	process.exit(1);
}
