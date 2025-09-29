CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- Name of the user
	username TEXT UNIQUE NOT NULL,
	-- Email of the user
	email TEXT UNIQUE NOT NULL,
	-- Nickname of the user
	nickname TEXT UNIQUE NOT NULL,
	-- avatar
	avatar TEXT NOT NULL,
	-- level
	level INTEGER DEFAULT 0,
	-- experience points of the user
	experience_points INTEGER DEFAULT 0,
	-- title of the user
	title TEXT NOT NULL DEFAULT 'the weak',
	-- gender
	gender CHAR NOT NULL,
	-- matches winner
	wins INTEGER DEFAULT 0,
	-- matches loser
	losses INTEGER DEFAULT 0,
	-- percentage total of wins / losses
	win_rate REAL NOT NULL DEFAULT 0.0,
	-- description
	description TEXT DEFAULT NULL,
	-- Original time
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	-- Modification time
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
