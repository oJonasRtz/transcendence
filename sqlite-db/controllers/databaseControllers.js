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

		try {
			await fastify.db.run("INSERT INTO auth (username, nickname, password, email) VALUES (?, ?, ?, ?)", [ username, nickname, password_hash, email ]);
			return reply.code(204).send();
		} catch (err) {
			if (err.code === 'SQLITE_CONSTRAINT')
				return reply.code(409).send("USER_ALREADY_EXISTS");
			return reply.code(500).send("INTERNAL_SERVER_ERROR");
		}
	}
};

export default databaseControllers;
