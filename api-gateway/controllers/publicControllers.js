import axios from 'axios';
import jwt from 'jsonwebtoken';

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

		 delete req.session.success;
		 delete req.session.error;

		try {
			const response = await axios.get("http://auth-service:3001/getCaptcha");
			const { code, data } = response.data;
			req.session.captcha = code;
			req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

                	return reply.view("login", { success, error, captcha: data });
		} catch (err) {
			error.push('Error loading the captcha D=');
			return reply.view("login", { success, error, captcha: null });
		}
        },

        register: async function getRegisterPage(req, reply) {
                let success = [];
                let error = [];

		 success = req.session.success || [];
		 error = req.session.error || [];

		 delete req.session.success;
		 delete req.session.error;

		try {
			const response = await axios.get("http://auth-service:3001/getCaptcha");
			const { code, data } = response.data;
			req.session.captcha = code;
			req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
                
			return reply.view("register", { success, error, captcha: data });
		} catch (err) {
			error.push('Error loading the captcha D=');
			return reply.view("register", { success, error, captcha: null });
		}
        },

	//SETTERS

	checkRegister: async function tryRegisterNewUser(req, reply) {
		let success = [];
		let error = [];
		try {
			const response = await axios.post("http://auth-service:3001/checkRegister", req.body);

			success = response.data.success || [];
			error = response.data.error || [];

			req.session.success = success;
			req.session.error = error;

			return reply.redirect("/login");
		} catch (err) {
			success = err.response.data.success || [];
			error = err.response.data.error || [];
			return reply.view("register", { success, error });
		}
	},

	// Authentication
	
	checkLogin: async function tryLoginTheUser(req, reply) {
		let success = [];
		let error = [];
		try {
			const response = await axios.post("http://auth-service:3001/checkLogin", req.body);

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
			console.error("Error trying login:", err);
			return reply.view("login", { success, error });
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

			await axios.post("http://auth-service:3001/checkEmail", req.body);

			req.session.email = req.body.email;

			return reply.redirect("/checkEmailCode");

		} catch (err) {
			delete req.session.email;

			if (err?.response?.status === 400)
				error.push("You need to fill all fields");
			else if (err?.response?.status === 404)
				error.push("User not found");
			req.session.success = success;
			req.session.error = error;
			console.error("api-gateway error no checkEmail:", err.message);
			return reply.redirect("/forgotPassword");
		}
	},

	checkEmailCode: async function checkEmailCode(req, reply) {
		if (!req.session.email) {
			req.session.success = [];
			req.session.error = ["You need to follow step by step"];
			return reply.redirect("/login");
		}
		return reply.view("checkEmailCode", {});
	},

	//TESTS
	hello: async function testAuthServiceConnection (req, reply) {
		try {
                        const result = await axios.get("http://auth-service:3001/hello");
                        return reply.send(`API GATEWAY - auth: ${result.data}`);
                } catch (err) {
                        console.error("Unfortunately, the api-gateway failed to communicate with auth-service by:", err.message);
                        return reply.code(500).send("Error:", err.message);
                }
	},

	checkDb: async function testGatewayConnectionWithSqlite (req, reply) {
                try {
                        const result = await axios.get("http://sqlite-db:3002/hello");
                        return reply.send(`API GATEWAY - sqlite: ${result.data}`);
                } catch (err) {
                        console.error("Unfortunately, the api-gateway failed to communicate with sqlite-db by:", err.message);
                        return reply.send("The API-GATEWAY cannot access database anymore");
                }
	}
};

export default publicControllers;
