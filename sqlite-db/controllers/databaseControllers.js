import axios from 'axios';
import bcrypt from 'bcrypt';

const databaseControllers = {
	hello: function testDatabaseConnection(req, reply) {
		return reply.send("The sqlite-db is working perfectly");
	},

	registerNewUser: async function registerNewUser(fastify, req, reply) {
		try {
			const { username, nickname, password, email, is2faEnable } = req.body;

			if (!username || !nickname || !password || !email)
				return reply.code(400).send("You need to fill all the fields");

			const password_hash = await bcrypt.hash(password, 12);
		
			await fastify.db.run("INSERT INTO auth (username, nickname, password, email, twoFactorEnable) VALUES (?, ?, ?, ?, ?)", [ username, nickname, password_hash, email, is2faEnable ]);
			return reply.code(204).send();
		} catch (err) {
			if (err.code === 'SQLITE_CONSTRAINT')
				return reply.code(409).send("USER_ALREADY_EXISTS");
			console.error("Error:", err);
			return reply.code(500).send("INTERNAL_SERVER_ERROR");
		}
	},

	tryLoginTheUser: async function tryLoginTheUser(fastify, req, reply) {
		try {
			const { email, password } = req.body;

			if (!email || !password)
				return reply.code(400).send("You need to fill all the fields");

			const object = await fastify.db.get("SELECT password FROM auth WHERE email = ?", [ email ]);
			if (!object.password)
				return reply.code(404).send("The user does not exist");
			const match = await bcrypt.compare(password, object.password);
			if (!match)
				return reply.code(401).send("User/Password incorrect");
			return reply.code(204).send();
		} catch (err) {
			console.error("Error trying login the user:", err.message);
			return reply.code(500).send(err.message);
		}
	},

	getUserData: async function getUserData(fastify, req, reply) {
		try {
			const email = req.body;

			if (!email)
				return reply.code(400).send("You need to give the email to make that request");
			const { username, id } = await fastify.db.get("SELECT username, id FROM auth WHERE email = ?", [ email ]);
			if (!username || !id)
				return reply.code(404).send("Not found the user");
			return (reply.code(200).send({ username: username, id: id }));
		} catch (err) {
			console.error("Error during getting the user data:", err);
			return reply.code(500).send("Internal server error");
		}
	}
};

export default databaseControllers;
