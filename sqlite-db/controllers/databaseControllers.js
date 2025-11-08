import axios from 'axios';
import bcrypt from 'bcrypt';

const databaseControllers = {
	hello: function testDatabaseConnection(req, reply) {
		return reply.send("The sqlite-db is working perfectly");
	},

	registerNewUser: async function registerNewUser(fastify, req, reply) {
		const { username, nickname, password, email } = req.body;

		if (!username || !nickname || !password || !email)
			throw new Error("MISSING_INPUT");

		const password_hash = await bcrypt.hash(password, 12);

		await fastify.db.exec("INSERT INTO auth (username, nickname, password, email) VALUES (?, ?, ?, ?)", [ username, nickname, password_hash, email ]);
		return reply.code(204);
	}
};

export default databaseControllers;
