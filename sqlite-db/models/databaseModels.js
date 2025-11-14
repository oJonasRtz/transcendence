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

	registerNewUser: async function registerNewUser(fastify, data, password_hash) {
		await fastify.db.run("INSERT INTO auth (username, nickname, password, email, twoFactorEnable) VALUES (?, ?, ?, ?, ?)", 
			[ data.username, data.nickname, password_hash, data.email, data.is2faEnable ]);
	},

	checkEmail: async function checkEmail(fastify, email) {
		const match = await fastify.db.get("SELECT email FROM auth WHERE email = ?", [ email ]);
		return (match || null);
	},

	getPassword: async function getPassword(fastify, email) {
		const object = await fastify.db.get("SELECT password FROM auth WHERE email = ?", [ email ]);
		return (object || null);
	},

	newPassword: async function newPassword(fastify, email, password_hash) {
		await fastify.db.get("UPDATE auth SET password = ? WHERE email = ?", [ password_hash, email ]);
		return (true);
	},

	getUserId: async function getUserId(fastify, username) {
		const user_id = await fastify.db.get("SELECT id FROM auth WHERE username = ?", [ username ]);
		return (user_id || null);
	},

	createNewUser: async function createNewUser(fastify, user_id) {
		await fastify.db.run("INSERT INTO users (user_id) VALUES (?)", [ user_id ]);
	},

	activateEmail: async function validateUserEmail(fastify, email) {
		await fastify.db.exec("UPDATE users SET isEmailConfirmed = true");
	}
}

export default databaseModels;
