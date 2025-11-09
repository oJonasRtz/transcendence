import axios from 'axios';
import bcrypt from 'bcrypt';

const databaseControllers = {
	hello: function testDatabaseConnection(req, reply) {
		return reply.send("The sqlite-db is working perfectly");
	},

	registerNewUser: async function registerNewUser(fastify, req, reply) {
		const { username, nickname, password, email } = req.body;

		console.log("username:",username);
		console.log("nickname:",nickname);
		console.log("password:",password);
		console.log("email:",email);
		if (!username || !nickname || !password || !email)
			throw new Error("MISSING_INPUT");

		const password_hash = await bcrypt.hash(password, 12);

		console.log("Vou tentar registrar");
		await fastify.db.run("INSERT INTO auth (username, nickname, password, email) VALUES (?, ?, ?, ?)", [ username, nickname, password_hash, email ]);
		console.log("Registrei");
		return reply.code(204).send();
	}
};

export default databaseControllers;
