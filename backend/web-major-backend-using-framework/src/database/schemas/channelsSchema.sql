CREATE TABLE IF NOT EXISTS bank_of_messages (
	-- id of message
	message_id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- owner of that message
	owner_message TEXT NOT NULL,
	-- content of message
	data_message TEXT NOT NULL,
	-- associate channel
	target_channel TEXT NOT NULL,
	-- id of associate channel
	target_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS invited_members (
	-- id of member invited
	id_invited INTEGER PRIMARY KEY AUTOINCREMENT,
	-- target_channel
	channelName TEXT NOT NULL,
	-- target channel ID
	channelId INTEGER NOT NULL,
	-- username
	username TEXT NOT NULL,
	-- nickname
	nickname TEXT NOT NULL,
	-- email
	email TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS channels_members (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- username
	username TEXT UNIQUE NOT NULL,
	-- nickname
	nickname TEXT UNIQUE NOT NULL,
	-- email
	email TEXT UNIQUE NOT NULL,
	-- channel of the member
	channel_name TEXT NOT NULL,
	-- id of channel
	channel_id INTEGER NOT NULL,
	-- isOperator
	isOperator BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS channels (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- name of the channel
	name TEXT UNIQUE NOT NULL,
	-- topic of the channel
	topic TEXT NOT NULL,
	-- public or private
	is_private BOOLEAN DEFAULT FALSE,
	-- has password
	has_password TEXT DEFAULT NULL,
	-- need invitation
	invitation BOOLEAN DEFAULT FALSE,
	-- number of members
	members INTEGER DEFAULT 0,
	-- is possible change everyone the topic?
	changeTopic BOOLEAN DEFAULT TRUE,
	-- limit
	has_limit BOOLEAN DEFAULT FALSE,
	-- limitOfUsers
	players_limit INTEGER DEFAULT 0,
	-- players in that channel
	players INTEGER DEFAULT 0,
	-- create time
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	-- update time
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
