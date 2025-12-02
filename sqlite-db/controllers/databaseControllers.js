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
			const { username, user_id } = await databaseModels.getUserData(fastify, email);
			if (!username || !user_id)
				return reply.code(404).send("Not found the user");
			return (reply.code(200).send({ username: username, user_id: user_id }));
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

			const password_hash = await bcrypt.hash(password, 12);

			const object = await databaseModels.getPassword(fastify, email);

			const match = await bcrypt.compare(password, object.password);
			if (match)
				return reply.code(409).send("You cannot put the same password as a new one");

			await databaseModels.newPassword(fastify, email, password_hash);

			return reply.code(200).send("success");
		} catch (err) {
			console.error("Sqlite-db (newPassword) Error in newPassword changing password", err);
			return reply.code(500).send("Fatal error");
		}
	},

	createNewUser: async function createNewUser(fastify, req, reply) {
		try {
			const { username, user_id } = req.body;

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

	getUserStatus: async function getUserStatus(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const status = await databaseModels.getUserStatus(fastify, req.body.email);
			return reply.code(200).send({ status: status });
		} catch (err) {
			console.error("getUserStatus SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},


	getMatchId: async function getMatchId(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const match_id = await databaseModels.getMatchId(fastify, req.body.email);
			return reply.code(200).send({ match_id: match_id });
		} catch (err) {
			console.error("getMatchId SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setMatchId: async function setMatchId(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.match_id === undefined)
				return reply.code(400).send("You need to inform an email and the match_id here");
			await databaseModels.setMatchId(fastify, req.body.email, req.body.match_id);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setMatchId SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	getQueue: async function getQueue(fastify, req, reply) {
		try {
			const queue = await databaseModels.getQueue(fastify);
			return reply.code(200).send(queue ?? {});
		} catch (err) {
			console.error("getQueue SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setIsOnline: async function setIsOnline(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || req.body.isOnline === undefined)
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
			if(!req.body || !req.body.user_id || !req.body.email)
				return reply.code(400).send("You need to inform an email and user_id here");
			const avatar = await databaseModels.getUserAvatar(fastify, req.body);
			return reply.code(200).send(avatar ?? {});
		} catch (err) {
			console.error ("getUserAvatar SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setInQueue: async function setInQueue(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.inQueue === undefined)
				return reply.code(400).send("You need to inform an email and the signal for inQueue here");
			await databaseModels.setInQueue(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setInQueue SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setRank: async function setRank(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.rank === undefined)
				return reply.code(400).send("You need to inform an email and the rank here");
			await databaseModels.setRank(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setRank SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserAvatar: async function setUserAvatar(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.avatar)
				return reply.code(400).send("You need to inform an user_id and avatar here");
			await databaseModels.setUserAvatar(fastify, req.body);
			return reply.code(201).send("Success");
		} catch (err) {
			console.error("setUserAvatar SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	getUserInformation: async function getUserInformation(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform your user_id here");
			const data = await databaseModels.getUserInformation(fastify, req.body);
			return reply.code(200).send(data ?? {});
		} catch (err) {
			console.error("getUserInformation error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	// You need to create the routes below 
	setUserDescription: async function setUserDescription(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.description)
				return reply.code(400).send("You need to inform your user_id here");
			await databaseModels.setUserDescription(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserDescription SQLITE-DB error", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserExperience: async function setUserExperiencePoints(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.experience)
				return reply.code(400).send("You need to inform your user_id/experience here");
			await databaseModels.setUserExperience(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserExperience SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserFriends: async function setUserFriends(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.friends)
				return reply.code(400).send("You need to inform your user_id/quantity of new friends here");
			await databaseModels.setUserFriends(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserFriends SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	// win_rate automatically update in frontend
	
	setUserWins: async function setUserWins(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.wins)
				return reply.code(400).send("You need to inform your user_id and new wins");
			await databaseModels.setUserWins(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserWins SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserLosses: async function setUserLosses(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.losses)
				return reply.code(400).send("You need to inform your user_id and new losses");
			await databaseModels.setUserLosses(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserLosses SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserTitle: async function setUserTitle(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.title)
				return reply.code(400).send("You need to inform your user_id and a new title");
			await databaseModels.setUserTitle(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserTitle SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	getAuthData: async function getAuthData(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform your user_id here");
			const data = await databaseModels.getAuthData(fastify, req.body);
			return reply.code(200).send(data ?? {});
		} catch (err) {
			console.error("getAuthData SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthUsername: async function setAuthUsername(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.username)
				return reply.code(400).send("You need to inform your user_id and a new username here");
			await databaseModels.setAuthUsername(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setAuthUsername SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthNickname: async function setAuthNickname(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.username)
				return reply.code(400).send("You need to inform your user_id and a new nickname here");
			await databaseModels.setAuthNickname(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setAuthNickname SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthEmail: async function setAuthEmail(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.email)
				return reply.code(400).send("You need to inform your user_id and a new email here");
			await databaseModels.setAuthEmail(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setAuthEmail SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthPassword: async function setAuthPassword(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.email || !req.body.password)
				return reply.code(400).send("You need to inform your user_id, email and a new password here");
			const object = await databaseModels.getUserPassword(fastify, req.body.email);
			if (!object || !object.password)
				return reply.code(404).send("Invalid credentials");
			const match = await bcrypt.compare(req.body.password, object.password);
			if (match)
				return reply.code(400).send("You cannot change your password to the same one");
			const password_hash = await bcrypt.hash(req.body.password, 12);
			req.body.password_hash = password_hash;
			await databaseModels.setAuthPassword(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setAuthPassword SQLITE-DB error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	getAllUsersInformation: async function getAllUsersInformation(fastify, req, reply) {
		try {
			const object = await databaseModels.getAllUsersInformation(fastify);
			return reply.code(200).send(object ?? null);
		} catch (err) {
			console.error("SQLITE-DB getAllUsersInformation:", err);
			return reply.code(500).send("An error happened");
		}
	},

	getDataByPublicId: async function getDataByPublicId(fastify, req, reply) {
		try {
			if (!req.body || !req.body.public_id)
				return reply.code(400).send("You need to inform the public_id here");
			const object = await databaseModels.getDataByPublicId(fastify, req.body);
			return reply.code(200).send(object ?? null);
		} catch (err) {
			console.error("SQLITE-DB getDataByPublicId ERROR:", err);
			return reply.code(500).send("An error happened");
		}
	},

	deleteUserAccount: async function deleteUserAccount(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform the user_id here");
			await databaseModels.deleteUserAccount(fastify, req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("SQLITE-DB deleteUserAccount ERROR:", err);
			return reply.code(500).send("An error happened");
		}
	},

	storeMessage: async function storeMessage(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.msg)
				return reply.code(400).send("You need to inform the user_id and the message here");
			await databaseModels.storeMessage(fastify, req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("SQLITE-DB storeMessage ERROR:", err);
			return reply.code(500).send("An error happened");
		}
	}
};

export default databaseControllers;
