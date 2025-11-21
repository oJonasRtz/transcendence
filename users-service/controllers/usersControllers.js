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
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email here");
			const avatar = await axios.post("http://sqlite-db:3002/getUserAvatar", { email: req.body.email });
			console.log("response users-service:", avatar?.data);
			return reply.code(200).send(avatar?.data ?? null);
		} catch (err) {
			console.error("getUserAvatar Error users-service:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setUserAvatar: async function setUserAvatar(req, reply) {
		try {
			if (!req.body || !req.body.email || !req.body.avatar)
				return reply.code(400).send("You need to inform an email and an avatar here");
			await axios.post("http://sqlite-db:3002/setUserAvatar", { email: req.body.email, avatar: req.body.avatar });
			return reply.code(201).send("Avatar updated successfully");
		} catch (err) {
			console.error("setUserAvatar users-service error:", err);
			return reply.code(500).send("Error setting an avatar");
		}
	}
}

export default usersControllers;
