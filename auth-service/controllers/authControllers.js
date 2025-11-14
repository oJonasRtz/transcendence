import axios from 'axios';
import authModels from '../models/authModels.js';
import jwt from 'jsonwebtoken';
import svgCaptcha from 'svg-captcha';

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
			console.error("tryLoginTheUser Auth:", err);
			if (err.response && err.response.status === 401) {
				error.push("Email/Password Incorrect");
				return reply.code(401).send({ success, error });
			}
			else if (err.response && err.response.status === 404) {
				error.push("The user does not exist");
				return reply.code(404).send({ success, error });
			}
			error.push(`An error happened trying to login: ${err}`);
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

			await axios.post("https://users-service:3003/createNewUser", req.body);

			success.push(`User ${username} ${nickname} added successfully`);
			return reply.code(200).send({ success, error });
		} catch (err) {
			console.error("checkRegister Auth:", err);
			if (err?.response?.status === 409) {
				error.push("User already exists");
				return reply.code(409).send({ success, error });
			}
			error.push(`An error happening: ${err.message}`);
			return reply.code(500).send({ success, error });
		}
	},

	getCaptcha: async function getCaptchaImageCode(req, reply) {
		const captcha = svgCaptcha.create({
			size: 5,
			noise: 3,
			color: true,
			background: "#f4f4f4"
		});

		const svgBase64 = Buffer.from(captcha.data).toString('base64');

		return reply
			.code(200)
			.type("application/json")
			.send({ code: captcha.text, data: `data:image/svg+xml;base64,${svgBase64}` });
	},

	checkEmail: async function checkEmail(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email, please");

			await axios.post("https://sqlite-db:3002/checkEmail", req.body);

			return reply.code(200).send("E-mail confirmed");
		}
		catch (err) {
			console.error("Error da auth:", err.message);
			if (err?.response?.status === 404)
				return reply.code(404).send("Not found a user");
			return reply.code(500).send("Internal Server Error");
		}
	},

	newPassword: async function newPassword(req, reply) {
		if (!req.body || !req.body.password || !req.body.confirmPassword)
			return reply.code(400).send("You need to fill all the fields");

		if (req.body.password !== req.body.confirmPassword)
			return reply.code(403).send("Password and ConfirmPassword mismatch");

		try {
			await axios.post("https://sqlite-db:3002/newPassword", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			if (err?.response?.status === 409)
				return reply.code(409).send("Same password");
			return reply.code(500).send("Internal Server Error");
		}
	},

	// TESTS
	hello: function testAuthServiceConnection(req, reply) {
		return reply.send("The auth-service is working perfectly");
	},

	helloDb: async function testCommunicationAuthWithDatabase(req, reply) {
		try {
                        const response = await axios.get("https://sqlite-db:3002/hello");
                        return reply.send(`Auth-service confirms communication with sqlite-db ${response.data}`);
                        console.log("Success communicating with database");
                } catch(err) {
                        console.error("The auth-service cannot communicate correctly with sqlite-db");
                        return reply.code(500).json({ error: "INTERNAL_SERVER_ERROR" });
                }
	}
}

export default authControllers;
