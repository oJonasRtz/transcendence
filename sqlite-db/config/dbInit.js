import { mkdir } from 'node:fs/promises';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export default async function initDatabase() {
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
                        password TEXT NOT NULL,
			twoFactorEnable BOOLEAN DEFAULT FALSE,
			twoFactorSecret TEXT DEFAULT NULL
                );
        `);

        console.log("Database and its folder created successfully");
	return (db);
} catch (err) {
        	console.error("Error creating the Database or its folder");
        	process.exit(1);
	}
}
