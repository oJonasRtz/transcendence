import usersModel from '../models/usersModel.js';
import axios from 'axios';

const usersControllers = {
	createNewUser: async function createNewUser(req, reply) {
		if (!req.body || !req.body.email)
			return reply.code(400).send("You need to inform user id");
		try {
			await usersModel.createNewUser(req.body);

			return reply.code(201).send("New user account created");
		} catch (err) {
			console.error(`users-service USERS: ${err}`);
			return reply.code(500).send("Error creating user account");
		}
	},

	validateUserEmail: async function validateUserEmail(req, reply) {
                try {
                        if (!req.body || !req.body.email) 
                                return reply.code(400).send("You need to inform a valid e-mail");

			console.log("email users:", req.body.email);

                        await axios.post("http://sqlite-db:3002/validateUserEmail", req.body);

                        return reply.code(200).send("Success");
                } catch (err) {
                        console.error("validateUserEmail USERS", err);
                        return reply.code(500).send("Internal Server Error");
                }
        },

	getIsOnline: async function getIsOnline(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const isOnline = await axios.post("http://sqlite-db:3002/getIsOnline", req.body);
			return reply.code(200).send(isOnline ?? {});
		} catch (err) {
			console.error("Users-Service getIsOnline", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	getQueue: async function getQueue(req, reply) {
		try {
			const queue = await axios.post("http://sqlite-db:3002/getQueue", {});
			return reply.code(200).send(queue?.data ?? {});
		} catch (error) {
			console.error("Users-Service getQueue", error);
			return reply.code(500).send("Internal Server Error");
		}
	},

	getMatchId: async function getMatchId(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const matchId = await axios.post("http://sqlite-db:3002/getMatchId", req.body);
			return reply.code(200).send(matchId?.data ?? {});
		} catch (err) {
			console.error("Users-Service getMatchId", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	setMatchId: async function setMatchId(req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.match_id === undefined)
				return reply.code(400).send("You need to inform an email and the match_id");
			await axios.post("http://sqlite-db:3002/setMatchId", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("USERS-SERVICE setMatchId", err);
			return reply.code(500).send("An error happened");
		}
	},

	setInQueue: async function setInQueue(req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.inQueue === undefined)
				return reply.code(400).send("You need to inform an email and the signal for inQueue");
			await axios.post("http://sqlite-db:3002/setInQueue", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("USERS-SERVICE setIsQueue", err);
			return reply.code(500).send("An error happened");
		}
	},

	setRank: async function setRank(req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.rank === undefined)
				return reply.code(400).send("You need to inform an email and the rank");
			await axios.post("http://sqlite-db:3002/setRank", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("USERS-SERVICE setRank", err);
			return reply.code(500).send("An error happened");
		}
	},

	getUserStatus: async function getUserStatus(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const status = await axios.post("http://sqlite-db:3002/getUserStatus", req.body);
			return reply.code(200).send(status?.data ?? {});
		} catch (err) {
			console.error("Users-Service getUserStatus", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	setIsOnline: async function setIsOnline(req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.isOnline === undefined)
				return reply.code(400).send("You need to inform an email and the signal for isOnline");
			await axios.post("http://sqlite-db:3002/setIsOnline", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("USERS-SERVICE setIsOnline", err);
			return reply.code(500).send("An error happened");
		}
	},

	getUserAvatar: async function getUserAvatar(req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const avatar = await axios.post("http://sqlite-db:3002/getUserAvatar", { user_id: req.body.user_id, email: req.body.email });
			console.log("response users-service:", avatar?.data);
			return reply.code(200).send(avatar?.data ?? null);
		} catch (err) {
			console.error("getUserAvatar Error users-service:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserAvatar: async function setUserAvatar(req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.avatar)
				return reply.code(400).send("You need to inform an user_id and an avatar here");
			await axios.post("http://sqlite-db:3002/setUserAvatar", { user_id: req.body.user_id, avatar: req.body.avatar });
			return reply.code(201).send("Avatar updated successfully");
		} catch (err) {
			console.error("setUserAvatar users-service error:", err);
			return reply.code(500).send("Error setting an avatar");
		}
	},

	getInGame: async function getInGame(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const inGame = await axios.post("http://sqlite-db:3002/getInGame", req.body);
			return reply.code(200).send(inGame ?? {});
		} catch (err) {
			console.error("Users-Service getInGame", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	setInGame: async function setInGame(req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.inGame === undefined)
				return reply.code(400).send("You need to inform an email and the signal for inGame");
			await axios.post("http://sqlite-db:3002/setInGame", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("USERS-SERVICE setInGame", err);
			return reply.code(500).send("An error happened");
		}
	},

	getUserInformation: async function getUserInformation(req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform an user_id here");
			const response = await axios.post("http://sqlite-db:3002/getUserInformation", { user_id: req.body.user_id });
			return reply.code(200).send(response?.data ?? null);
		} catch (err) {
			console.error("USERS-SERVICE getUserInformation", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserDescription: async function setUserDescription(req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.description)
				return reply.code(400).send("You need to inform an user_id and a description here");
			const response = await axios.post("http://sqlite-db:3002/setUserDescription", req.body);
			return reply.code(200).send(response?.data ?? null);
		} catch (err) {
			console.error("USERS-SERVICE setUserDescription");
			return reply.code(500).send(response?.data ?? null);
		}
	},

	getAllUsersInformation: async function getAllUsersInformation(req, reply) {
		try {
			const response = await axios.get("http://sqlite-db:3002/getAllUsersInformation");
			return reply.code(200).send(response?.data ?? null);
		} catch (err) {
			console.error("USERS-SERVICE getAllUsersInformation", err);
			return reply.code(500).send("An error happened");
		}
	}
}

export default usersControllers;
