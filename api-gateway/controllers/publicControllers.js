import axios from 'axios';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/sendMail.js';

const publicControllers = {
	
	//GETTERS
	
	homePage: function getHomePage(req, reply) {
		return reply.view("homePage");
	},

	 login: async function getLoginPage(req, reply) {
                let success = [];
                let error = [];

		 success = req.session.success || [];
		 error = req.session.error || [];

		delete req.session.captcha;
		delete req.session.captchaExpires;
		delete req.session.email;
		delete req.session.permission;
		delete req.session.success;
		delete req.session.error;

		try {
			const response = await axios.get("https://auth-service:3001/getCaptcha");
			const { code, data } = response.data;
			req.session.captcha = code;
			req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

                	return reply.view("login", { success, error, captcha: data });
		} catch (err) {
			req.session.error = [`Error loading the captcha D= : ${err.message}`];
			return reply.redirect("/login");
		}
        },

        register: async function getRegisterPage(req, reply) {
                let success = [];
                let error = [];

		 success = req.session.success || [];
		 error = req.session.error || [];

		delete req.session.captcha;
		delete req.session.captchaExpires;
		delete req.session.email;
		delete req.session.permission;
		delete req.session.success;
		delete req.session.error;

		try {
			const response = await axios.get("https://auth-service:3001/getCaptcha");
			const { code, data } = response.data;
			req.session.captcha = code;
			req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
                
			return reply.view("register", { success, error, captcha: data });
		} catch (err) {
			req.session.error = [`An error happened: ${err.message}`];
			return reply.redirect("/register");
		}
        },

	//SETTERS

	checkRegister: async function tryRegisterNewUser(req, reply) {
		let success = [];
		let error = [];
		try {
			const response = await axios.post("https://auth-service:3001/checkRegister", req.body);

			success = response.data.success || [];
			error = response.data.error || [];

			req.session.success = success;
			req.session.error = error;

			return reply.redirect("/login");
		} catch (err) {
			error = [`${err.message}`];
			req.session.success = success;
			req.session.error = error;

			return reply.redirect("/register");
		}
	},

	// Authentication
	
	checkLogin: async function tryLoginTheUser(req, reply) {
		let success = [];
		let error = [];
		try {
			const response = await axios.post("https://auth-service:3001/checkLogin", req.body);

			const token = response.data.token;
			if (!token) 
				return reply.redirect("/login");
			const isProduction = process.env.NODE_ENV === "production";

			reply.setCookie("jwt", token, {
                               	httpOnly: true,
                               	secure: isProduction,
                               	path: "/",
                               	sameSite: "lax",
                               	maxAge: 60 * 60 * 1000 // 1h
                        });

			return reply.redirect("/home");
		} catch (err) {
			success = err?.response?.data?.success || []; // optional, we are thinking about it
			error = err?.response?.data?.error || [];
			req.session.success = success;
			req.session.error = error;
			console.error("Error trying login:", err);
			return reply.redirect("/login");
		}
	},


	forgotPasswordPage: async function forgotPasswordPage(req, reply) {
		let success = [];
		let error = [];

		success = req.session.success || [];
		error = req.session.error || [];

		delete req.session.success;
		delete req.session.error;

		return reply.view("forgotPasswordPage", { success, error });
	},

	checkEmail: async function checkEmail(req, reply) {
		let success = [];
		let error = [];

		try {
			if (!req.body || !req.body.email) {
				error.push("User not found");
				req.session.success = success;
				req.session.error = error;
				return reply.redirect("/forgotPassword");
			}

			await axios.post("https://auth-service:3001/checkEmail", req.body);

			req.session.email = req.body.email;

                        const response = await axios.get("https://auth-service:3001/getCaptcha");
                        const { code, data } = response.data;
                        req.session.captcha = code;
                        req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

                        const receiver = req.session.email;
                        const subject = "Forgot Password - Transcendence";
                        const webPage = `
                                <h2>Forgot Password - Your Pong Transcendence</h2>
                                <p>Please, you need to inform the code below to change the password of your account</p>
                                <p>The code is ${code}. Type it in the checkEmailCode page to validate it</p>
                        `;
                        await sendMail(receiver, subject, webPage);

			return reply.redirect("/validateEmailCode");

		} catch (err) {
			delete req.session.email;
			delete req.session.captcha;
                        delete req.session.captchaExpires;
                        delete req.session.email;
			delete req.session.permission;

			if (err?.response?.status === 400)
				error.push("You need to fill all fields");
			else if (err?.response?.status === 404)
				error.push("User not found");
			else
				error.push("An error happened trying to checking E-mail");
			req.session.success = success;
			req.session.error = error;
			console.error("api-gateway error no checkEmail:", err.message);
			return reply.redirect("/forgotPassword");
		}
	},

	validateEmailCode: async function validateEmailCode(req, reply) {
		if (!req.session.email) {
			req.session.error = ["You need to follow step by step"];
			return redirect("/login");
		}
		const error = req.session.error || [];
		delete req.session.error;
		return reply.view("checkEmailCode", { error });
	},

	checkEmailCode: async function checkEmailCode(req, reply) {
		if (!req.session.email || !req.body || !req.body.captchaInput) {
			req.session.success = [];
			req.session.error = ["You need to follow step by step"];
			return reply.redirect("/login");
		}

		// validator hook validates the captchaInput

		req.session.permission = true;
		return reply.redirect("/changePassword");
	},

	changePassword: async function validateEmailCode(req, reply) {
		if (!req.session.email || !req.session.permission) {

			req.session.error = ["You need to follow step by step"];
			return reply.redirect("/login");
		}
		const error = req.session.error || [];
		delete req.session.error;

		return reply.view("changePassword", { error });
	},

	newPassword: async function newPassword(req, reply) {
		if (!req.body || !req.session.permission || !req.session.email || !req.body.password || !req.body.confirmPassword) {
			req.session.error = ["You need to follow step by step"];
			return reply.redirect("/login");
		}

		try {
			if (req.body.new2FA === undefined)
				req.body.new2FA = false;
			else
				req.body.new2FA = true;
			req.body.email = req.session.email;
			await axios.post("https://auth-service:3001/newPassword", req.body);
			req.session.success = ["Password changed successfully"];
			if (req.body.new2FA)
				await axios.post("https://auth-service:3001/set2FASecret", { email: req.body.email, secret: null });
			return reply.redirect("/login");
		} catch (err) {
			if (err?.response?.status === 409) {
				req.session.error = ["You cannot put the same password as a new one"];
				return reply.redirect("/login");
			}
			req.session.error = ["An error happened when we are trying to change your password as requested D="];
			return reply.redirect("/changePassword");
		}
	},

	//TESTS
	hello: async function testAuthServiceConnection (req, reply) {
		try {
                        const result = await axios.get("https://auth-service:3001/hello");
                        return reply.send(`API GATEWAY - auth: ${result.data}`);
                } catch (err) {
                        console.error("Unfortunately, the api-gateway failed to communicate with auth-service by:", err.message);
                        return reply.code(500).send("Error:", err.message);
                }
	},

	checkDb: async function testGatewayConnectionWithSqlite (req, reply) {
                try {
                        const result = await axios.get("https://sqlite-db:3002/hello");
                        return reply.send(`API GATEWAY - sqlite: ${result.data}`);
                } catch (err) {
                        console.error("Unfortunately, the api-gateway failed to communicate with sqlite-db by:", err.message);
                        return reply.send("The API-GATEWAY cannot access database anymore");
                }
	}
};

export default publicControllers;
