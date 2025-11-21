import axios from 'axios';
import bcrypt from 'bcrypt';
import databaseModels from '../models/databaseModels.js';

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
	
			await databaseModels.registerNewUser(fastify, req.body, password_hash);

			return reply.code(204).send();
		} catch (err) {
			console.error("registerNewUser SQlite-db:", err);
			if (err.code === 'SQLITE_CONSTRAINT')
				return reply.code(409).send("USER_ALREADY_EXISTS");
			return reply.code(500).send("INTERNAL_SERVER_ERROR");
		}
	},

	tryLoginTheUser: async function tryLoginTheUser(fastify, req, reply) {
		try {
			const { email, password } = req.body;

			if (!email || !password)
				return reply.code(400).send("You need to fill all the fields");

			const object = await databaseModels.getUserPassword(fastify, email);
			if (!object || !object.password)
				return reply.code(404).send("The user does not exist");
			const match = await bcrypt.compare(password, object.password);
			if (!match)
				return reply.code(401).send("User/Password incorrect");
			return reply.code(204).send();
		} catch (err) {
			console.error("tryLoginTheUser SQlite-db:", err);
			console.error("Error trying login the user:", err.message);
			return reply.code(500).send(err.message);
		}
	},

	getUserData: async function getUserData(fastify, req, reply) {
		try {
			const email = req.body;

			if (!email)
				return reply.code(400).send("You need to give the email to make that request");
			const { username, id } = await databaseModels.getUserData(fastify, email);
			if (!username || !id)
				return reply.code(404).send("Not found the user");
			return (reply.code(200).send({ username: username, id: id }));
		} catch (err) {
			console.error("getUserData SQlite-db:", err);
			console.error("Error during getting the user data:", err);
			return reply.code(500).send("Internal server error");
		}
	},

	checkEmail: async function checkEmail(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an e-mail");

			const { email } = req.body;

			const match = await databaseModels.checkEmail(fastify, email);

			if (!match)
				return reply.code(404).send("There is not a user with that target email");

			return reply.code(200).send("That is a valid e-mail");
		} catch (err) {
			console.error("Error na sqlite-db checkEmail:", err.message);
			return reply.code(500).send("Internal Server Error");
		}
	},

	newPassword: async function newPassword(fastify, req, reply) {
		try {
			const { password, email } = req.body;

			if (!password || !email)
				throw new Error("You forgot password or email");

			console.log("password:", password, "email", email);

			const password_hash = await bcrypt.hash(password, 12);

			const object = await databaseModels.getPassword(fastify, email);

			const match = await bcrypt.compare(password, object.password);
			if (match)
				return reply.code(409).send("You cannot put the same password as a new one");

			console.log("new password hash:", password_hash);
			await databaseModels.newPassword(fastify, email, password_hash);

			return reply.code(200).send("success");
		} catch (err) {
			console.error("Sqlite-db (newPassword) Error in newPassword changing password", err);
			return reply.code(500).send("Fatal error");
		}
	},

	createNewUser: async function createNewUser(fastify, req, reply) {
		try {
			const { username } = req.body;

			const user_id = await databaseModels.getUserId(fastify, username);
			await databaseModels.createNewUser(fastify, user_id);
			return reply.code(201).send("Success");
		} catch (err) {
			console.error(`SQLITE-DB ERROR createNewUser ${err}`);
			return reply.code(500).send("Error creating the user");
		}
	},

	validateUserEmail: async function validateUserEmail(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			await databaseModels.activateEmail(fastify, req.body.email);

			return reply.code(200).send("Success");
		} catch (err) {
			console.error(`validateUserEmail Sqlite-db: ${err}`);
			return reply.code(500).send("An error happened trying to validate your e-mail");
		}
	},

	get2FAEnable: async function get2FAEnable(fastify, req, reply) {
		try { 
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const result = await databaseModels.get2FAEnable(fastify, req.body.email);
			return reply.code(200).send(result ?? {});
		} catch (err) {
			console.error("Sqlite-db get2FAEnable:", err);
			return reply.code(500).send("Internal server error");
		}
	},

	get2FASecret: async function get2FASecret(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");

			const result = await databaseModels.get2FASecret(fastify, req.body.email);
			return reply.code(200).send(result ?? {});
		} catch (err) {
			console.error("Sqlite-db get2FASecret:", err);
			return reply.code(500).send("Internal server error");
		}
	},

	set2FASecret: async function set2FASecret(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			await databaseModels.set2FASecret(fastify, req.body.email, req.body.secret);
			return reply.code(200).send("Secret set successfully");
		} catch (err) {
			console.error("set2FASecret SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	get2FAValidate: async function get2FAValidate(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const result = await databaseModels.get2FAValidate(fastify, req.body.email);
			return reply.code(200).send(result ?? null);
		} catch (err) {
			console.error("get2FAValidate ERROR", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	set2FAValidate: async function set2FAValidate(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.signal === undefined)
				return reply.code(400).send("You need to inform an email here");
			await databaseModels.set2FAValidate(fastify, req.body.email, req.body.signal);
			return reply.code(200).send("Signal updated successfully");
		} catch (err) {
			console.error("set2FAValidate SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	getIsOnline: async function getIsOnline(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const isOnline = await databaseModels.getIsOnline(fastify, req.body.email);
			return reply.code(200).send(isOnline ?? {});
		} catch (err) {
			console.error("getIsOnline SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setIsOnline: async function setIsOnline(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.isOnline === undefined)
				return reply.code(400).send("You need to inform an email here");
			await databaseModels.setIsOnline(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setIsOnline SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	getUserAvatar: async function getUserAvatar(fastify, req, reply) {
		try {
			if(!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const response = await databaseModels.getUserAvatar(fastify, req.body);
			return reply.code(200).send(response?.data ?? {});
		} catch (err) {
			console.error ("getUserAvatar SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserAvatar: async function setUserAvatar(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || !req.body.avatar)
				return reply.code(400).send("You need to inform an email and avatar here");
			const response = await databaseModels.setUserAvatar(fastify, req.body);
			return reply.code(200).send(response?.data.avatar ?? {});
		} catch (err) {
			console.error("setUserAvatar SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	}
};

export default databaseControllers;
