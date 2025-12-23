CREATE TABLE IF NOT EXISTS ranking_member (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- nickname
	nickname TEXT NOT NULL,
	-- experience_points
	experience_points INTEGER NOT NULL,
	-- level
	level INTEGER NOT NULL,
	-- title
	title TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ranking (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- ranking name
	name TEXT NOT NULL,
	-- Specif the game name
	game TEXT NOT NULL,
	-- Tournaments, normal rankings
	type_of_ranking TEXT NOT NULL
);
