import axios from 'axios';
import authModels from '../models/authModels.js';
import jwt from 'jsonwebtoken';

// AUTH-SERVICE CONTROLLERS

const authControllers = {

	// SETTERS

	tryLoginTheUser: async function tryLoginTheUser(req, reply) {
		const success = [];
		const error = [];

		try {
			const { email, password } = req.body;

			if (!email || !password) {
				error.push("You need to fill all the fields");
				return reply.code(400).send({ success, error });
			}

			await authModels.tryLoginTheUser(req.body);

			const { username, id } = await authModels.getUserData(email);

			const user_id = id;
			const payload = { username, user_id, email };

			const token = jwt.sign(payload, process.env.JWT_SECRET || "purpleVoid", {
				expiresIn: process.env.JWT_EXPIRES_IN || "1h"
			});

			return reply.code(200).send({ success, error, token });
		} catch (err) {
			error.push(`An error happened trying to login: ${err.message}`);
			return reply.code(500).send({ success, error });
		}
	},

	checkRegister: async function tryRegisterTheUser(req, reply) {
		const success = [];
		const error = [];
		try {
			const { username, nickname, email, password, confirmPassword } = req.body;

			if (!username || !nickname || !email || !password || !confirmPassword) {
				error.push("Please, fill all fields");
				return reply.code(400).send({ success, error });
			}

			req.body.is2faEnable = req.body.is2faEnable === "true";

			if (password !== confirmPassword) {
				error.push("Password Mismatch");
				return reply.code(409).send({ success, error });
			}

			await authModels.registerNewUser(req.body);

			success.push(`User ${username} ${nickname} added successfully`);
			return reply.code(200).send({ success, error });
		} catch (err) {
			if (err?.response?.status === 409) {
				error.push("User already exists");
				return reply.code(409).send({ success, error });
			}
			error.push(`An error happening: ${err.message}`);
			return reply.code(500).send({ success, error });
		}
	},

	// TESTS
	hello: function testAuthServiceConnection(req, reply) {
		return reply.send("The auth-service is working perfectly");
	},

	helloDb: async function testCommunicationAuthWithDatabase(req, reply) {
		try {
                        const response = await axios.get("http://sqlite-db:3002/hello");
                        return reply.send(`Auth-service confirms communication with sqlite-db ${response.data}`);
                        console.log("Success communicating with database");
                } catch(err) {
                        console.error("The auth-service cannot communicate correctly with sqlite-db");
                        return reply.code(500).json({ error: "INTERNAL_SERVER_ERROR" });
                }
	}
}

export default authControllers;
