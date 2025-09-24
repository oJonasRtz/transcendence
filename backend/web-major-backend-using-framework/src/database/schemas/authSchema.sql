CREATE TABLE IF NOT EXISTS auth (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	-- Name of the user
	username TEXT UNIQUE NOT NULL,
	-- Email of the user
	email TEXT UNIQUE NOT NULL,
	-- Nickname of the user
	nickname TEXT UNIQUE NOT NULL,
	-- Password hashed of the user
	password_hash VARCHAR(1000) NOT NULL,
	-- Password version, we can improve the algorithm
	password_version INTEGER DEFAULT 1,
	-- You forgot the password and made mistakes so many times
	locked_until TEXT DEFAULT NULL,
	-- Is the user account?
	is_active BOOLEAN DEFAULT 0,
	-- Last login of the user
	last_login_at TEXT DEFAULT NULL,
	-- Last IP of the last login
	last_login_ip TEXT DEFAULT NULL,
	-- Counting mistakes during trying to login
	failed_login_count INTEGER DEFAULT 0,
	-- Create datetime
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	-- Create update time 
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

