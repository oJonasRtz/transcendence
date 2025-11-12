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
			twoFactorSecret TEXT DEFAULT NULL,
			created_at DATETIME DEFAULT (datetime('now')),
			updated_at DATETIME DEFAULT (datetime('now'))
                );
        `);

	await db.exec(`
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			experience_points INTEGER NOT NULL,
			avatar TEXT NOT NULL,
			isOnline TEXT DEFAULT 'offline',
			description TEXT DEFAULT NULL,
			friends INTEGER DEFAULT 0,
			wins INTEGER DEFAULT 0,
			losses INTEGER DEFAULT 0,
			win_rate DECIMAL(10,2) DEFAULT 0.0,
			created_at DATETIME DEFAULT (datetime('now')),
			updated_at DATETIME DEFAULT (datetime('now'))
		);
	`);

	// TRIGGERS -> event listener, it can help us to do an action if we detect an event happened

	await db.exec(`CREATE TRIGGER IF NOT EXISTS update_users_datetime
			AFTER UPDATE ON users
			FOR EACH ROW
			BEGIN
				UPDATE users
				SET updated_at = datetime('now')
				WHERE id = OLD.id;
			END;`
	);

	await db.exec(`CREATE TRIGGER IF NOT EXISTS update_auth_datetime
			AFTER UPDATE ON auth
			FOR EACH ROW
			BEGIN
				UPDATE auth
				SET updated_at = datetime('now')
				WHERE id = OLD.id;
			END;`
	);
			
        console.log("Database and its folder created successfully");
	return (db);
} catch (err) {
        	console.error("Error creating the Database or its folder");
        	process.exit(1);
	}
}
