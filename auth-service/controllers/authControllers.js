import axios from 'axios';
import authModels from '../models/authModels.js';
import jwt from 'jsonwebtoken';
import svgCaptcha from 'svg-captcha';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { randomUUID } from 'crypto';

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

			const { username, user_id } = await authModels.getUserData(email);

			console.log("user_id: auth-service", user_id);
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

	createNewToken: async function createNewToken(req, reply) {
		try {
			if (!req.body || !req.body.email || !req.body.user_id || !req.body.username)
				return reply.code(400).send("Bad request, you need to inform email, user_id and username");
			const { username, email, user_id } = req.body;
			const payload = { username, email, user_id };
			const token = jwt.sign(payload, process.env.JWT_SECRET || "purpleVoid", {
				expiresIn: process.env.JWT_EXPIRESIN || "1h"
			});
			return reply.code(200).send({ token });
		} catch (err) {
			console.error("Auth-Service CreateNewToken Error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	checkRegister: async function tryRegisterTheUser(req, reply) {
		const success = [];
		const error = [];
		try {
			const { user_id, username, nickname, email, password, confirmPassword } = req.body;

			if (!user_id || !username || !nickname || !email || !password || !confirmPassword) {
				error.push("Please, fill all fields");
				return reply.code(400).send({ success, error });
			}

			req.body.is2faEnable = req.body.is2faEnable === "true";

			if (password !== confirmPassword) {
				error.push("Password Mismatch");
				return reply.code(409).send({ success, error });
			}

			await authModels.registerNewUser(req.body);

			await axios.post("http://users-service:3003/createNewUser", req.body);

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
			size: 6,
			noise: 4,
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

			await axios.post("http://sqlite-db:3002/checkEmail", req.body);

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
			await axios.post("http://sqlite-db:3002/newPassword", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			if (err?.response?.status === 409)
				return reply.code(409).send("Same password");
			return reply.code(500).send("Internal Server Error");
		}
	},

	get2FAQrCode: async function generate2FASendIt(req, reply) {
		if (!req.body || !req.body.email)
			return reply.code(400).send("You need to inform an username here");
		try {
			let response = await axios.post("http://auth-service:3001/get2FAEnable", { email: req.body.email });
			if (!response?.data.twoFactorEnable)
				return reply.code(400).send("2FA not activated");
			const twoFactorSecret = await axios.post("http://auth-service:3001/get2FASecret", { email: req.body.email });
			if (!twoFactorSecret?.data.twoFactorSecret) {
				const secret2FA = speakeasy.generateSecret({ name: `Transcendence: ${req.body.email}` });
				const qrCodeDataURL = await qrcode.toDataURL(secret2FA.otpauth_url);
				await axios.post("http://sqlite-db:3002/set2FASecret", { email: req.body.email, secret: secret2FA.base32 });
				return reply.code(200).send({ qrCodeDataURL: qrCodeDataURL, image: null });
			}

			/*const otpauth = speakeasy.otpauthURL({
				secret: twoFactorSecret?.data.twoFactorSecret,
				label: `Transcendence: ${req.body.email}`,
				issuer: "Transcendence",
				encoding: "base32",
			});

			const qrCodeDataURL = await qrcode.toDataURL(otpauth);*/

			const qrCodeDataURL = '/public/images/road_closed.jpg';
			const image = '/public/images/road_closed.jpg';

			return reply.code(200).send({ qrCodeDataURL: qrCodeDataURL, image: image });

		} catch (err) {
			console.error("Auth-Service get2FAQrCode:", err);
			return reply.code(500).send("An error happened");
		}
	},

	get2FAEnable: async function get2FAEnable(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an e-mail here");
			const result = await axios.post("http://sqlite-db:3002/get2FAEnable", req.body);
			return reply.code(200).send({ twoFactorEnable: result?.data?.twoFactorEnable ?? null });
		} catch (err) {
			console.error("Auth-Service get2FAEnable", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	get2FASecret: async function get2FASecret(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an e-mail here");
			const result = await axios.post("http://sqlite-db:3002/get2FASecret", req.body);
			console.log("o result da auth secret:", result);
			return reply.code(200).send({ twoFactorSecret: result?.data?.twoFactorSecret ?? null });
		} catch (err) {
			console.error("Auth-Service get2FASecret", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	get2FAValidate: async function get2FAValidate(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an e-mail here");
			const result = await axios.post("http://sqlite-db:3002/get2FAValidate", req.body);
			return reply.code(200).send({ twoFactorValidate: result?.data?.twoFactorValidate ?? null });
		} catch (err) {
			console.error("Auth-Service get2FAValidate", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	set2FAValidate: async function set2FAValidate(req, reply) {
		try {
			if (!req.body || !req.body.email || req.body.signal === undefined)
				return reply.code(400).send("You need to inform an email and signal here");
			await axios.post("http://sqlite-db:3002/set2FAValidate", req.body);
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("Sqlite-db set2FAValidate", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	set2FASecret: async function set2FASecret(req, reply) {
		try {
			if (!req.body || !req.body.email)
				return reply.code(400).send("You need to inform an email");
			if (req.body.secret === undefined)
				req.body.secret = null;
			await axios.post("http://sqlite-db:3002/set2FASecret", { email: req.body.email, secret: req.body.secret });
			return reply.code(200).send("Success");
		} catch (err) {
			console.error("Auth-Service set2FASecret:", err);
			return reply.code(500).send("Internal Server Error");
		}
	},

	getAuthData: async function getAuthData(req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform your user_id");
			const data = await axios.post("http://sqlite-db:3002/getAuthData", req.body);
			return reply.code(200).send(data ?? {});
		} catch (err) {
			console.error("Auth-service getAuthData error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthUsername: async function setAuthUsername(req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.username)
				return reply.code(400).send("You need to inform your user_id and username");
			await axios.post("http://sqlite-db:3002/setAuthUsername", req.body);
			return reply.code(200).send("Username changed successfully");
		} catch (err) {
			console.error("Auth-service setAuthData error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthNickname: async function setAuthNickname(req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.nickname)
				return reply.code(400).send("You need to inform your user_id and nickname");
			await axios.post("http://sqlite-db:3002/setAuthNickname", req.body);
			return reply.code(200).send("Nickname changed successfully");
		} catch (err) {
			console.error("Auth-service setAuthNickname error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthEmail: async function setAuthEmail(req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.email)
				return reply.code(400).send("You need to inform your user_id and e-mail");
			await axios.post("http://sqlite-db:3002/setAuthEmail", req.body);
			return reply.code(200).send("Nickname changed successfully");
		} catch (err) {
			console.error("Auth-service setAuthEmail error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	setAuthPassword: async function setAuthPassword(req, reply) {
		try {
			if (!req.body || !req.body.user_id || !req.body.password)
				return reply.code(400).send("You need to inform your user_id and the new password");
			await axios.post("http://sqlite-db:3002/setAuthPassword", req.body);
			return reply.code(200).send("Password changed successfully");
		} catch (err) {
			if (err?.response.status === 400)
				return reply.code(400).send("You cannot change to the same password");
			console.error("Auth-service setAuthPassword error:", err);
			return reply.code(500).send("An error happened");
		}
	},

	deleteUserAccount: async function deleteUserAccount(req, reply) {
		try {
			if (!req.body || !req.body.user_id)
				return reply.code(400).send("You need to inform your user_id here");
			await axios.post("http://sqlite-db:3002/deleteUserAccount", req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("AUTH-SERVICE deleteUserAccount error:", err);
			return reply.code(500).send("An error happened");
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
