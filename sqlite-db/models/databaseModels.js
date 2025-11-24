import bcrypt from 'bcrypt';

const databaseModels = {
	getUserData: async function getUserData(fastify, email) {
		let object = await fastify.db.get("SELECT username, id FROM auth WHERE email = ?", [ email ]);
		if (!object)
			object = null;
		return (object);
	},

	getUserPassword: async function getUserPassword(fastify, email) {
		let object = await fastify.db.get("SELECT password from auth WHERE email = ?", [ email ]);
		if (!object)
			object = null;
		return (object);
	},
	
	getQueue: async function getQueue(fastify) {
		const queue = await fastify.db.all(`
			SELECT 
				a.username,
				u.rank,
				u.user_id
			FROM users u
			JOIN auth a ON a.id = u.user_id
			WHERE u.isOnline = TRUE
			AND u.inQueue = TRUE
		`);

		return queue ?? [];
	},

	registerNewUser: async function registerNewUser(fastify, data, password_hash) {
		await fastify.db.run("INSERT INTO auth (username, nickname, password, email, twoFactorEnable) VALUES (?, ?, ?, ?, ?)", 
			[ data.username, data.nickname, password_hash, data.email, data.is2faEnable ]);
	},

	checkEmail: async function checkEmail(fastify, email) {
		const match = await fastify.db.get("SELECT email FROM auth WHERE email = ?", [ email ]);
		return (match ?? null);
	},

	getPassword: async function getPassword(fastify, email) {
		const object = await fastify.db.get("SELECT password FROM auth WHERE email = ?", [ email ]);
		return (object ?? null);
	},

	newPassword: async function newPassword(fastify, email, password_hash) {
		await fastify.db.run("UPDATE auth SET password = ? WHERE email = ?", [ password_hash, email ]);
		return (true);
	},

	getUserId: async function getUserId(fastify, username) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE username = ?", [ username ]);
		return (user_id.id ?? null);
	},

	createNewUser: async function createNewUser(fastify, user_id) {
		await fastify.db.run("INSERT INTO users (user_id) VALUES (?)", [ user_id ]);
	},

	activateEmail: async function validateUserEmail(fastify, email) {
		await fastify.db.run("UPDATE users SET isEmailConfirmed = true");
	},

	get2FAEnable: async function get2FAEnable(fastify, email) {
		const twoFactorEnable = await fastify.db.get("SELECT twoFactorEnable FROM auth WHERE email = ?", [ email ]);
		if (!twoFactorEnable)
			return (null);
		return (twoFactorEnable);
	},

	set2FASecret: async function set2FASecret(fastify, email, secret) {
		console.log("email do set:", email, "secret do set:", secret);
		await fastify.db.run("UPDATE auth SET twoFactorSecret = ? WHERE email = ?", [ secret, email ]);
	},

	get2FASecret: async function get2FASecret(fastify, email) {
		const twoFactorSecret = await fastify.db.get("SELECT twoFactorSecret FROM auth WHERE email = ?", [ email ]);
		if (!twoFactorSecret)
			return (null);
		return (twoFactorSecret);
	},

	get2FAValidate: async function get2FAValidate(fastify, email) {
		const twoFactorValidate = await fastify.db.get("SELECT twoFactorValidate FROM auth WHERE email = ?", [ email ]);
		if (!twoFactorValidate)
			return (null);
		return (twoFactorValidate);
	},

	set2FAValidate: async function set2FAValidate(fastify, email, signal) {
		await fastify.db.run("UPDATE auth SET twoFactorValidate = ? WHERE email = ?", [ signal, email ]);
		return (true);
	},

	getIsOnline: async function getIsOnline(fastify, email) {
		const isOnline = await fastify.db.get("SELECT isOnline FROM users WHERE email = ?", [ email ]);
		if (!isOnline)
			return (null);
		return (isOnline);
	},

	setIsOnline: async function setIsOnline(fastify, data) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE email = ?", [ data.email ]);
		await fastify.db.run("UPDATE users SET isOnline = ? WHERE user_id = ?", [ data.isOnline, user_id.id ]);
		return (true);
	},

	setInQueue: async function setInQueue(fastify, data) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE email = ?", [ data.email ]);
		await fastify.db.run("UPDATE users SET inQueue = ? WHERE user_id = ?", [ data.inQueue, user_id.id ]);
		return (true);
	},

	getUserAvatar: async function getUserAvatar(fastify, data) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE email = ?", [ data.email ]);
		if (!user_id)
			return ({});
		const avatar = await fastify.db.get("SELECT avatar FROM users WHERE id = ?", [ user_id.id ]);
		return (avatar ?? null);
	},

	setUserAvatar: async function setUserAvatar(fastify, data) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE email = ?", [ data.email ]);
		if (!user_id)
			return (null);
		await fastify.db.run("UPDATE users SET avatar = ? WHERE id = ?", [ data.avatar, user_id.id ]);
		return (true);
	},

	setRank: async function setRank(fastify, data) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE email = ?", [ data.email ]);
		if (!user_id)
			return (null);

		await fastify.db.run("UPDATE users SET rank = ? WHERE id = ?", [ data.rank, user_id.id ]);
		return (true);
	},

	getInGame: async function getInGame(fastify, email) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE email = ?", [ email ]);
		if (!user_id)
			return (null);
		const inGame = await fastify.db.get("SELECT inGame FROM users WHERE id = ?", [ user_id.id ]);
		return (inGame ?? null);
	},

	setInGame: async function setInGame(fastify, data) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE email = ?", [ data.email ]);
		if (!user_id)
			return (null);
		await fastify.db.run("UPDATE users SET inGame = ? WHERE id = ?", [ data.inGame, user_id.id ]);
		return (true);
	},

	getUserInformation: async function getUserInformation(fastify, data) {
		const response = await fastify.db.get("SELECT * FROM users WHERE user_id = ?", [ data.user_id ]);
		return (response ?? null);
	}
}

export default databaseModels;
