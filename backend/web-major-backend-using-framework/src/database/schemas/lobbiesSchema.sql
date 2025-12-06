CREATE TABLE IF NOT EXISTS lobbies_members (
	member_id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- username of the member
	username TEXT UNIQUE NOT NULL,
	-- nickname of the member
	nickname TEXT UNIQUE NOT NULL,
	-- email of the member
	email TEXT UNIQUE NOT NULL,
	-- room id of member
	lobby_id INTEGER NOT NULL,
	-- room name of member
	lobby_name TEXT NOT NULL,
	-- creation time
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lobbies (
	lobby_id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- name of the lobby
	lobby_name TEXT UNIQUE NOT NULL,
	-- mode of the game
	game_mode TEXT NOT NULL,
	-- the quantity of players in that room
	players INTEGER DEFAULT 0,
	-- private / public
	is_private BOOLEAN DEFAULT FALSE,
	-- is there a limit of players?
	has_limit BOOLEAN DEFAULT FALSE,
	-- what is the limit number?
	maximum_players INTEGER DEFAULT NULL,
	-- creation time of the room
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	-- update time of the room
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	-- Security check
	CHECK (maximum_players IS NULL OR maximum_players >= 2)
);
