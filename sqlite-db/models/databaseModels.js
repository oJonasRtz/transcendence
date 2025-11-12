import bcrypt import 'bcrypt';

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

	newPassword: async function newPassword(fastify, password, email) {
		const password_hash = await bcrypt.hash();
		await fastify.db.get("UPDATE auth SET password_hash = ? WHERE email = ?", [ password, email ]);
	}
}

export default databaseModels;
