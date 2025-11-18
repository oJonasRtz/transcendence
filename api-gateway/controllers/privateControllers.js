import axios from 'axios';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/sendMail.js';
import speakeasy from 'speakeasy';

const privateControllers = {
	helloDb: async function testPrivateRoute(req, reply) {
                try {
                        const result = await axios.get("https://auth-service:3001/helloDb");
                        return reply.send(`API GATEWAY - auth: ${result.data}`);
                } catch (err) {
                        return reply.send(`Unfortunately, the auth-service cannot access the database: ${err.message}`);
                }
	},

	getHomePage: async function getHomePage(req, reply) {
		try {
			const token = req.jwt;

			if (!token) {
				console.log("You are not authenticated");
				return reply.redirect("/login");
			}

			const username = req.user.username;

			const success = req.session.success || [];
			const error = req.session.error || [];

			delete req.session.success;
			delete req.session.error;

			req.user.isOnline = true;

			const isOnline = req.user.isOnline;
			await axios.post("https://auth-service:3001/setIsOnline", req.user);
			return reply.view("home", { username, success, error, isOnline } );
		} catch (err) {
			console.error("getHomePage API-GATEWAY ERROR:", err);
			return reply.redirect("/login");
		}
	},

	logout: async function logoutTheUser(req, reply) {

		// erase all cookies

		const token = req.cookies.jwt;
		const decoded = jwt.decode(token) || {};

		req.user.isOnline = false;

		await axios.post("https://auth-service:3001/setIsOnline", req.user);

		await req.session.destroy();

		reply.clearCookie("jwt");
		reply.clearCookie("session");

		await axios.post("https://auth-service:3001/set2FAValidate", { email: decoded.email, signal: false });
		return reply.redirect("/login");
	},

	confirmUserEmail: async function confirmUserEmail(req, reply) {
		try {
			const token = req.cookies.jwt;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const email = decoded.email;

			const response = await axios.get("https://auth-service:3001/getCaptcha");
			const { code, data } = response.data;

			delete req.session.captcha;
			delete req.session.captchaExpires;

			req.session.captcha = code;
			req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

			const receiver = email;
			const subject = "Confirm your e-mail, Transcendence Pong";
			const webPage = `
				<h2>Confirm your e-mail</h2>
				<p>Congratulations! Confirming your e-mail is a great choice to recover your password easily later</p>
				<p> Your code is <strong>${code}</strong>. Please inform it to us. See you =D</p>
			`;

			await sendMail(receiver, subject, webPage);

			return reply.redirect("/confirmUserEmailCode");
		} catch (err) {
			delete req.session.captcha;
			delete req.session.captchaExpires;

			if (err.response.status === 401)
				req.session.error = ["Invalid code"];
			else
				req.session.error = ["Unexpected error happened"];
			return reply.redirect("/confirmUserEmailCode");
		}
	},

	confirmUserEmailCode: async function confirmUserEmailCode(req, reply) {
		const error = req.session.error || [];
		delete req.session.error;
		return reply.view("confirmUserEmailCode", { error });
	},

	validateUserEmailCode: async function validateUserEmailCode(req, reply) {
		try {
			if (!req.body || !req.body.captchaInput) {
				req.session.error = ["You need to follow step by step"];
				return reply.redirect("/confirmUserEmailCode");
			}
			
			// validator hook, do your job

			const token = req.cookies.jwt;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			await axios.post("https://users-service:3003/validateUserEmail", { email: decoded.email });

			req.session.success = ["Your e-mail is validated now =D"];
			return reply.redirect("/home");
		} catch (err) {
			console.error("VALIDATE USER EMAIL CODE API-GATEWAY:", err);
			req.session.error = ["An error happened trying to validating your code"];
			return reply.redirect("/confirmUserEmailCode");
		}
	},

	get2FAQrCode: async function get2FAQrCode(req, reply) {
		try {
			const token = req.cookies.jwt;
			const decoded = await jwt.verify(token, process.env.JWT_SECRET);
			const res = await axios.post("https://auth-service:3001/get2FAEnable", { email: decoded.email });
			if (!res.data.twoFactorEnable) {
				req.session.error = ["You do not have 2FA activated at the moment"];
				return reply.redirect("/home");
			}
			const response = await axios.post("https://auth-service:3001/get2FAQrCode", { email: decoded.email });
			if (!response.data.qrCodeDataURL) {
				console.error("Error generating the qrCodeDataURL");
				return reply.code(500).send("Error generating the qrCode");
			}
			const qrCodeDataURL = response.data.qrCodeDataURL;
			req.session.qrCodeDataURL = qrCodeDataURL;
			return reply.redirect("/check2FAQrCode");
		} catch (err) {
			console.error("get2FAQrCode", err);
			req.session.error = ["Error getting get2FAQrCode"];
			return reply.redirect("/home");
		}
	},

	check2FAQrCode: async function check2FAQrCode(req, reply) {
		if (!req.session.qrCodeDataURL) {
			req.session.error = ["You need to follow step by step"];
			return redirect("/home");
		}
		const qrCodeDataURL = req.session.qrCodeDataURL;
		if (!qrCodeDataURL) {
			req.session.error = ["Error generating the qrcode"];
			return redirect("/home");
		}
		const error = req.session.error || [];
		delete req.session.error;
		req.session.canValidate = true;
		return reply.view("check2FAQrCode", { qrCodeDataURL, error } );
	},

	validate2FAQrCode: async function validate2FAQrCode(req, reply) {
		try {
			if (!req.session.canValidate) {
				req.session.error = ["You need to follow step by step"];
				delete req.session.canValidate;
				return reply.redirect("/home");
			}
			if (!req.body || !req.body.code) {
				req.session.error = ["You need to follow step by step"];
				return reply.redirect("/check2FAQrCode");
			}
			const token = req.cookies.jwt;
			const decoded = await jwt.verify(token, process.env.JWT_SECRET);
			const response = await axios.post("https://auth-service:3001/get2FASecret", { email: decoded.email });
			if (!response.data.twoFactorSecret) {
				req.session.error = ["You cannot have 2FA activate"];
				return reply.redirect("/home");
			}

			const code = req.body.code;
			const twoFactorSecret = response.data.twoFactorSecret;
			const verified = speakeasy.totp.verify({
                        secret: twoFactorSecret,
                        encoding: "base32",
                        token: code,
                        window: 1
                });

			if (!verified) {
				req.session.error = ["The code is incorrect. Try again"];
				return reply.redirect("/check2FAQrCode");
			}
			req.session.success = ["2FA passed successfully"];
			await axios.post("https://auth-service:3001/set2FAValidate", { email: decoded.email, signal: true });
			return reply.redirect("/home");
		} catch (err) {
			console.error("Validate2FAQrCode Api-Gateway", err);
			req.session.error = ["An error happened trying to validate your 2FA Code"];
			return reply.redirect("/home");
		}
	}
};

export default privateControllers;
