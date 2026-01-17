import axios from 'axios';
import bcrypt from 'bcrypt';
import databaseModels from '../models/databaseModels.js';

const databaseControllers = {
	hello: function testDatabaseConnection(req, reply) {
		return reply.send("The sqlite-db is working perfectly");
	},

	addHistory: async function addHistory(fastify, req, reply) {
		try {
			if (!req.body || !req.body.stats)
				return reply.code(400).send("INVALID_FORMAT");
			await databaseModels.addHistory(fastify, req.body.stats);
			return reply.code(201).send("History added successfully");
		} catch (err) {
			console.error("addHistory SQLITE-DB error:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getHistory: async function getHistory(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform your user_id here");
			const history = await databaseModels.getHistory(fastify, req.body.user_id);
			return reply.code(200).send(history ?? []);
		} catch (err) {
			console.error("getHistory SQLITE-DB error:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
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
			console.error("registerNewUser SQlite-db:", err?.response?.data || err.message);
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
			console.error("tryLoginTheUser SQlite-db:", err?.response?.data || err.message);
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
			console.error("getUserData SQlite-db:", err?.response?.data || err.message);
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
			console.error("Error na sqlite-db checkEmail:", err?.response?.data || err.message.message);
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
			console.error("Sqlite-db (newPassword) Error in newPassword changing password", err?.response?.data || err.message);
			return reply.code(500).send("Fatal error");
		}
	},

	createNewUser: async function createNewUser(fastify, req, reply) {
		try {
			const { username, user_id } = req.body;

			await databaseModels.createNewUser(fastify, user_id);
			return reply.code(201).send("Success");
		} catch (err) {
			console.error(`SQLITE-DB ERROR createNewUser ${err?.response?.data || err.message}`);
			return reply.code(500).send("Error creating the user");
		}
	},

	validateUserEmail: async function validateUserEmail(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.stats === undefined)
				return reply.code(400).send("You need to inform an email and put a valid status here");
			await databaseModels.activateEmail(fastify, req.body);

			return reply.code(200).send("Success");
		} catch (err) {
			console.error(`validateUserEmail Sqlite-db: ${err?.response?.data || err.message}`);
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
			console.error("Sqlite-db get2FAEnable:", err?.response?.data || err.message);
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
			console.error("Sqlite-db get2FASecret:", err?.response?.data || err.message);
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
			console.error("set2FASecret SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("get2FAValidate ERROR", err?.response?.data || err.message);
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
			console.error("set2FAValidate SQLITE-DB err?.response?.data || err.messageor:", err?.response?.data || err.message);
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
			console.error("getIsOnline SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("getUserStatus SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("getMatchId SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("setMatchId SQLITE-DB error", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getQueue: async function getQueue(fastify, req, reply) {
		try {
			const queue = await databaseModels.getQueue(fastify);
			return reply.code(200).send(queue ?? {});
		} catch (err) {
			console.error("getQueue SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("setIsOnline SQLITE-DB error", err?.response?.data || err.message);
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
			console.error ("getUserAvatar SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("setInQueue SQLITE-DB error", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	setUserState: async function setUserState(fastify, req, reply) {
		try {
			if (!req.body || !req.body.email || !req.body.state)
				return reply.code(400).send("You need to inform an email and the state here");
			await databaseModels.setUserState(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserState SQLITE-DB error", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	setRank: async function setRank(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || req.body.rank === undefined)
				return reply.code(400).send("You need to inform an email and the rank here");
			await databaseModels.setRank(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setRank SQLITE-DB error", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getRank: async function getRank(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform an email here");
			const rank = await databaseModels.getRank(fastify, req.body.user_id);
			return reply.code(200).send(rank ?? {});
		} catch (err) {
			console.error("getRank SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("setUserAvatar SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("getUserInformation error:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	// You need to create the routes below 
	setUserDescription: async function setUserDescription(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || req.body.description === undefined)
				return reply.code(400).send("You need to inform your user_id here");
			await databaseModels.setUserDescription(fastify, req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("setUserDescription SQLITE-DB error", err?.response?.data || err.message);
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
			console.error("setUserExperience SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("setUserFriends SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("setUserWins SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("setUserLosses SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("setUserTitle SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("getAuthData SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("setAuthUsername SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("setAuthNickname SQLITE-DB error:", err?.response?.data || err.message);
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
			if (err?.statusCode === 409 || err?.message === "EMAIL_IN_USE")
				return reply.code(409).send("Email already in use");
			console.error("setAuthEmail SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("setAuthPassword SQLITE-DB error:", err?.response?.data || err.message);
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
			console.error("SQLITE-DB getDataByPublicId ERROR:", err?.response?.data || err.message);
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
			console.error("SQLITE-DB deleteUserAccount ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	storeMessage: async function storeMessage(fastify, req, reply) {
		try {
			if (!req.body || !req.body.name || !req.body.msg)
				return reply.code(400).send("You need to inform the name and the message here");
			const user_id = await databaseModels.getUserId(fastify, req.body.name);
			if (!user_id) {
				console.error("What is the user_id?", user_id);
				throw new Error("What is the user_id, my friend?");
			}
			req.body.user_id = user_id;
			await databaseModels.storeMessage(fastify, req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("SQLITE-DB storeMessage ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getAllMessages: async function getAllMessages(fastify, req, reply) {
		try {
			if (!req.body || !req.body.username)
				return reply.code(400).send("You need to inform who you are here");
			const messages = await databaseModels.getAllMessages(fastify, req.body);
			return reply.code(200).send(messages ?? null);
		} catch (err) {
			console.error("SQLITE-DB getAllMessages ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	blockTheUser: async function blockTheUser(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.public_id)
				return reply.code(400).send("You need to inform user_id and public_id");
			const result = await databaseModels.blockTheUser(fastify, req.body);
			if (result === "Block")
				return reply.code(201).send();
			else if (result === "SAME_USER")
				return reply.code(403).send("SAME_USER");
			return reply.code(204).send();
		} catch (err) {
			if (err?.response?.status === 403 || err?.response?.message === "SAME_USER") 
				return reply.code(403).send("SAME_USER");
			console.error("SQLITE-DB blockTheUser ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	friendInvite: async function friendInvite(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.public_id)
				return reply.code(400).send("You need to inform user_id and public_id");
			const result = await databaseModels.friendInvite(fastify, req.body);
			if (result === "invited")
				return reply.code(201).send();
			return reply.code(200).send();
		} catch (err) {
			if (err?.message === "SAME_USER")
				return reply.code(403).send("SAME_USER");
			console.error("SQLITE-DB friendInvite ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getAllFriends: async function getAllFriends(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform user_id");
			const result = await databaseModels.getAllFriends(fastify, req.body);
			return reply.code(200).send(result ?? null);
		} catch (err) {
			console.error("SQLITE-DB getAllFriends ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getAllPendencies: async function getAllPendencies(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform user_id");
			const result = await databaseModels.getAllPendencies(fastify, req.body);
			return reply.code(200).send(result ?? null);
		} catch (err) {
			console.error("SQLITE-DB getAllPendencies ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	setAcceptFriend: async function setAcceptFriend(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.public_id || !req.body.accept)
				return reply.code(400).send("You need to inform user_id");
			await databaseModels.setAcceptFriend(fastify, req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("SQLITE-DB setAcceptFriend", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	deleteAFriend: async function deleteAFriend(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.public_id)
				return reply.code(400).send("You need to inform user_id");
			await databaseModels.deleteAFriend(fastify, req.body);
			return (true);
		} catch (err) {
			console.error("SQLITE-DB deleteAFriend", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getAllBlacklist: async function getAllBlacklist(fastify, req, reply) {
		try {
			const blacklist = await databaseModels.getAllBlacklist(fastify, req.body);
			return reply.code(200).send(blacklist ?? null);
		} catch (err) {
			console.error("SQLITE-DB getAllBlacklist ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getAllPrivateMessages: async function getAllPrivateMessages(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.public_id)
				return reply.code(400).send("You need to inform user_id and public_id here");
			const privateMessages = await databaseModels.getPrivateMessages(fastify, req.body);
			return reply.code(200).send(privateMessages ?? []);
		} catch (err) {
			console.log("SQLITE-DB getAllPrivateMessages ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	storePrivateMessage: async function storePrivateMessage(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.public_id)
				return reply.code(400).send("You need to inform user_id and public_id here");
			await databaseModels.storePrivateMessage(fastify, req.body);
			return reply.code(201).send("Created");
		} catch (err) {
			console.error("SQLITE-DB storePrivateMessage ERROR:", err?.response?.data || err.message);
			return reply.code(500).send("An error happened");
		}
	},

	set2FAOnOff: async function set2FAOnOff(fastify, req, reply) {
                try {
                        if (!req.body || !req.body.user_id)
                                return reply.code(400).send("You need to inform user_id here");
                        const message = await databaseModels.set2FAOnOff(fastify, req.body);
                        return reply.code(200).send({ message: message });
                } catch (err) {
                        console.error("SQLITE-DB set2FAOnOff ERROR:", err.message);
                        return reply.code(500).send("An error happened");
                }
        },

	setTargetId: async function setTargetId(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.public_id)
				return reply.code(400).send("You need to inform user_id / public_id here");
			const message = await databaseModels.setTargetId(fastify, req.body);
			return reply.code(201).send({ message: "Success" });
		} catch (err) {
			console.error("SQLITE-DB setTargetId ERROR:", err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getTargetId: async function getTargetId(fastify, req, reply) {
		try {
			if (!req.body || !req.body.public_id)
				return reply.code(400).send("You need to inform public_id here");
			const target = await databaseModels.getTargetId(fastify, req.body);
			return reply.code(201).send(target ?? null);
		} catch (err) {
			console.error("SQLITE-DB getTargetId ERROR:", err.message);
			return reply.code(500).send("An error happened");
		}
	},

	getPublicId: async function getPublicId(fastify, req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform user_id here");
			const public_id = await databaseModels.getPublicId(fastify, req.body);
			return reply.code(201).send(public_id ?? null);
		} catch (err) {
			console.error("SQLITE-DB getPublicId ERROR:", err.message);
			return reply.code(500).send("An error happened");
		}
	}
};

export default databaseControllers;
