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
			user_id TEXT NOT NULL,
                        username TEXT UNIQUE NOT NULL,
                        nickname TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
			twoFactorEnable BOOLEAN DEFAULT FALSE,
			twoFactorSecret TEXT DEFAULT NULL,
			twoFactorValidate BOOLEAN DEFAULT FALSE,
			created_at DATETIME DEFAULT (datetime('now')),
			updated_at DATETIME DEFAULT (datetime('now'))
                );
        `);

		await db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id TEXT UNIQUE NOT NULL,
				experience_points INTEGER DEFAULT 0,
				avatar TEXT DEFAULT '/public/images/default.jpg',
				isOnline BOOLEAN DEFAULT FALSE,
				state TEXT DEFAULT 'OFFLINE',
				rank INTEGER DEFAULT 0,
				public_id TEXT UNIQUE NOT NULL,
				target_id TEXT NULL DEFAULT NULL,
				description TEXT DEFAULT NULL,
				isEmailConfirmed BOOLEAN DEFAULT FALSE,
				friends INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT (datetime('now')),
				updated_at DATETIME DEFAULT (datetime('now'))
			);
		`);

		await db.exec(`
			CREATE TABLE IF NOT EXISTS history (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				match_id INTEGER UNIQUE NOT NULL,
				created_at TEXT DEFAULT '00/00/0000 | 00:00:00',
				game_type TEXT DEFAULT 'RANKED',
				duration TEXT DEFAULT '00:00'
			);
		`);
		
		await db.exec(`
			CREATE TABLE IF NOT EXISTS history_players (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id TEXT NOT NULL,
				history_id INTEGER NOT NULL,
				score INTEGER NOT NULL,
				isWinner BOOLEAN DEFAULT FALSE,
				FOREIGN KEY (history_id) REFERENCES history(id),
				FOREIGN KEY (user_id) REFERENCES users(user_id),
				UNIQUE(history_id, user_id)
			);
		`);


		// Migrations for existing databases (add missing columns)
		// const usersColumns = await db.all("PRAGMA table_info(users)");
		// const usersColumnNames = new Set(usersColumns.map((col) => col.name));
		// if (!usersColumnNames.has("level")) {
		// 	await db.exec("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1");
		// }

		await db.exec(`CREATE TABLE IF NOT EXISTS messages (
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							content TEXT NOT NULL,
							sender_id TEXT NOT NULL,
				isSystem BOOLEAN DEFAULT false,
				isLink BOOLEAN DEFAULT false,
				avatar TEXT NOT NULL,
							created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
							);
		`);

		await db.exec(`CREATE TABLE IF NOT EXISTS privateMessages (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				content TEXT NOT NULL,
				sender_id TEXT NOT NULL,
				receiver_id TEXT NULL DEFAULT NULL,
				isSystem BOOLEAN DEFAULT false,
				isBlocked BOOLEAN DEFAULT false,
				avatar TEXT NOT NULL,
				isLink BOOLEAN DEFAULT false,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
				);
			`);

		await db.exec(`
							CREATE TABLE IF NOT EXISTS friends (
							id INTEGER PRIMARY KEY AUTOINCREMENT,
							owner_id TEXT NOT NULL,
							friend_id TEXT NOT NULL,
							accepted BOOLEAN DEFAULT FALSE,
							created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
							);
		`);

		await db.exec(`
				CREATE TABLE IF NOT EXISTS blacklist (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				owner_id TEXT NOT NULL,
				target_id TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        	console.error("Error creating the Database or its folder: " + err);
        	process.exit(1);
	}
}
