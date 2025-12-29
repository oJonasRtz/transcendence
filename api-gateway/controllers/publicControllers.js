import axios from 'axios';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import sendMail from '../utils/sendMail.js';
import { mkdir } from 'node:fs/promises';
import { randomUUID } from 'crypto';

const publicControllers = {

	//GETTERS

	getIcon: function getIcon(req, reply) {
		return reply.sendFile("favicon.ico");
	},
	
	homePage: function getHomePage(req, reply) {
		return reply.view("homePage");
	},

	 login: async function getLoginPage(req, reply) {
                let success = [];
                let error = [];

		 success = req.session.success ?? [];
		 error = req.session.error ?? [];

		delete req.session.captcha;
		delete req.session.captchaExpires;
		delete req.session.email;
		delete req.session.permission;
		delete req.session.success;
		delete req.session.error;

		try {
			const response = await axios.get("http://auth-service:3001/getCaptcha");
			const { code, data } = response.data;
			req.session.captcha = code;
			req.session.data = data;
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

		 success = req.session.success ?? [];
		 error = req.session.error ?? [];

		delete req.session.captcha;
		delete req.session.captchaExpires;
		delete req.session.email;
		delete req.session.permission;
		delete req.session.success;
		delete req.session.error;

		try {
			const response = await axios.get("http://auth-service:3001/getCaptcha");
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
			req.body.user_id = randomUUID();
			if (!req.body.username || !req.body.nickname || req.body.username.toLowerCase() === "system" || req.body.nickname.toLowerCase() === "system") {
				throw new Error("Fill everything or Forbidden Username/Nickname");
			}

			const response = await axios.post("http://auth-service:3001/checkRegister", req.body);

			success = response.data.success || [];
			error = response.data.error || [];

			// If auth-service returned errors, handle them
			if (error.length > 0) {
				if (req.isApiRequest) {
					return reply.code(400).send({ success, error });
				}
				req.session.success = success;
				req.session.error = error;
				return reply.redirect("/register");
			}

			await mkdir("/app/public/uploads", { recursive: true });
			await sharp("/app/public/images/default.jpg")
			.resize(350, 350)
			.composite([{
			input: Buffer.from(
			`<svg width="350" height="350">
			 <circle cx="175" cy="175" r="175" fill="white"/>
			 </svg>`
			 ),
			 blend: "dest-in"
		       }])
			 .png()
			 .toFile(`/app/public/uploads/avatar_${req.body.user_id}.png`);
			 let avatar = `/public/uploads/avatar_${req.body.user_id}.png`;
			 await axios.post("http://users-service:3003/setUserAvatar", { user_id: req.body.user_id, avatar: avatar });

			// For API requests, return JSON success
			if (req.isApiRequest) {
				return reply.code(200).send({ success, error: [] });
			}

			req.session.success = success;
			req.session.error = error;
			return reply.redirect("/login");
		} catch (err) {
			if (err?.response?.status === 409) {
				error = ["Username or email already exists"];
				if (req.isApiRequest) {
					return reply.code(409).send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/register");
			}
			error = [`${err.message}`];

			if (req.isApiRequest) {
				return reply.code(400).send({ success: [], error });
			}

			req.session.success = success;
			req.session.error = error;
			return reply.redirect("/register");
		}
	},

	// Authentication
	
	checkLogin: async function tryLoginTheUser(req, reply) {
		try {
			if (!req.body.captchaInput) {
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error: ["You forgot to fill captcha code"] });
				}
				req.session.error = ["You forgot to fill captcha code"];
				return reply.redirect("/login");
			}

			const response = await axios.post("http://auth-service:3001/checkLogin", req.body);

			const token = response?.data?.token;
			if (!token) {
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error: ["Invalid credentials"] });
				}
				req.session.error = ["Invalid credentials"];
				return reply.redirect("/login");
			};

			// Check if user has 2FA enabled
			const twoFactorCheck = await axios.post("http://auth-service:3001/get2FAEnable", { email: req.body.email });
			
			if (twoFactorCheck?.data?.twoFactorEnable) {
				// User has 2FA enabled - don't give full access yet
				// Store temporary token in session and require 2FA verification
				const decoded = jwt.verify(token, process.env.JWT_SECRET || "purpleVoid");
				
				// For API requests, return response indicating 2FA is required
				if (req.isApiRequest) {
					// Create a temporary token that only allows 2FA verification
					const tempToken = jwt.sign(
						{ 
							user_id: decoded.user_id, 
							email: decoded.email,
							username: decoded.username,
							public_id: decoded.public_id,
							pending2FA: true 
						}, 
						process.env.JWT_SECRET || "purpleVoid", 
						{ expiresIn: '5m' } // Short expiry for 2FA step
					);
					
					return reply.code(200).send({ 
						success: ["Credentials verified"], 
						error: [],
						requires2FA: true,
						tempToken: tempToken
					});
				}
				
				// For EJS requests, store in session and redirect to 2FA page
				req.session.pendingLoginToken = token;
				req.session.pendingEmail = req.body.email;
				return reply.redirect("/check2FAQrCode");
			}

			// No 2FA - proceed with normal login
			const isProduction = process.env.NODE_ENV === "production";

			reply.setCookie("jwt", token, {
                               	httpOnly: true,
                               	secure: isProduction,
                               	path: "/",
                               	sameSite: "strict",
                               	maxAge: 60 * 60 * 1000 // 1h
                        });

			// For API requests, return JSON with token
			if (req.isApiRequest) {
				return reply.code(200).send({ success: ["Login successful"], error: [], token });
			}

			return reply.redirect("/home");
		} catch (err) {
			const errorMessage = ["Invalid credentials"];

			if (req.isApiRequest) {
				return reply.code(400).send({ success: [], error: errorMessage });
			}

			if (err?.response?.status === 404) {
				req.session.error = errorMessage;
				return reply.redirect("/login");
			}
			req.session.error = errorMessage;
			console.error("Error trying login:", err);
			return reply.redirect("/login");
		}
	},

	// Verify 2FA code during login
	verifyLogin2FA: async function verifyLogin2FA(req, reply) {
		try {
			const { tempToken, code } = req.body;
			
			if (!tempToken || !code) {
				return reply.code(400).send({ 
					success: [], 
					error: ["Missing token or verification code"] 
				});
			}
			
			// Verify the temp token
			let decoded;
			try {
				decoded = jwt.verify(tempToken, process.env.JWT_SECRET || "purpleVoid");
			} catch (err) {
				return reply.code(401).send({ 
					success: [], 
					error: ["Session expired. Please login again."] 
				});
			}
			
			// Check that this is a pending 2FA token
			if (!decoded.pending2FA) {
				return reply.code(400).send({ 
					success: [], 
					error: ["Invalid token type"] 
				});
			}
			
			// Get the user's 2FA secret
			const secretResponse = await axios.post("http://auth-service:3001/get2FASecret", { 
				email: decoded.email 
			});
			
			if (!secretResponse?.data?.twoFactorSecret) {
				return reply.code(400).send({ 
					success: [], 
					error: ["2FA not properly configured"] 
				});
			}
			
			// Verify the TOTP code
			const speakeasy = (await import('speakeasy')).default;
			const verified = speakeasy.totp.verify({
				secret: secretResponse.data.twoFactorSecret,
				encoding: 'base32',
				token: code,
				window: 2 // Allow 2 time steps for clock drift
			});
			
			if (!verified) {
				return reply.code(400).send({ 
					success: [], 
					error: ["Invalid verification code"] 
				});
			}
			
			// 2FA verified! Create the full access token
			const fullToken = jwt.sign(
				{ 
					user_id: decoded.user_id, 
					email: decoded.email,
					username: decoded.username,
					public_id: decoded.public_id
				}, 
				process.env.JWT_SECRET || "purpleVoid", 
				{ expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
			);
			
			// Mark 2FA as validated for this session
			await axios.post("http://auth-service:3001/set2FAValidate", { 
				email: decoded.email, 
				signal: true 
			});
			
			const isProduction = process.env.NODE_ENV === "production";
			
			reply.setCookie("jwt", fullToken, {
				httpOnly: true,
				secure: isProduction,
				path: "/",
				sameSite: "strict",
				maxAge: 60 * 60 * 1000 // 1h
			});
			
			return reply.code(200).send({ 
				success: ["Login successful"], 
				error: [],
				token: fullToken
			});
		} catch (err) {
			console.error("Error verifying 2FA login:", err);
			return reply.code(500).send({ 
				success: [], 
				error: ["An error occurred. Please try again."] 
			});
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

                        const response = await axios.get("http://auth-service:3001/getCaptcha");
                        const { code, data } = response.data;
                        req.session.captcha = code;
                        req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

                        const receiver = req.session.email;
                        const subject = "Forgot Password - Transcendence";
                        const webPage = `
                                <h2>Forgot Password - Your Pong Transcendence</h2>
                                <p>Please, you need to inform the code below to change the password of your account</p>
                                <p>The code is <strong>${code}</strong>. Type it in the checkEmailCode page to validate it</p>
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
		return reply.redirect("/newPasswordPage");
	},

	newPasswordPage: async function validateEmailCode(req, reply) {
		if (!req.session.email || !req.session.permission) {
			req.session.error = ["You need to follow step by step"];
			return reply.redirect("/login");
		}
		const error = req.session.error ?? [];
		const success = req.session.success ?? [];
		delete req.session.error;

		return reply.view("newPasswordPage", { success, error });
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
			await axios.post("http://auth-service:3001/newPassword", req.body);
			req.session.success = ["Password changed successfully"];
			if (req.body.new2FA)
				await axios.post("http://auth-service:3001/set2FASecret", { email: req.body.email, secret: null });
			return reply.redirect("/login");
		} catch (err) {
			if (err?.response?.status === 409) {
				req.session.error = ["You cannot put the same password as a new one"];
				return reply.redirect("/login");
			}
			req.session.error = ["An error happened when we are trying to change your password as requested D="];
			return reply.redirect("/newPasswordPage");
		}
	},

	// Get CAPTCHA for Next.js frontend (stateless, no sessions)
	getCaptcha: async function getCaptcha(req, reply) {
		try {
			const response = await axios.get("http://auth-service:3001/getCaptcha");
			const { code, data } = response.data;

			// Return both code and image data for client-side validation
			// Note: This is different from EJS frontend which uses sessions
			return reply.code(200).send({ code, data });
		} catch (err) {
			console.error("Error fetching CAPTCHA:", err.message);
			return reply.code(500).send({ error: "Failed to generate CAPTCHA" });
		}
	},

	// API version of checkEmail that doesn't use sessions
	apiCheckEmail: async function apiCheckEmail(req, reply) {
		try {
			if (!req.body || !req.body.email) {
				return reply.code(400).send({ 
					success: [], 
					error: ["Email is required"] 
				});
			}

			// Check if user exists
			await axios.post("http://auth-service:3001/checkEmail", req.body);

			// Generate and send code via email
			const response = await axios.get("http://auth-service:3001/getCaptcha");
			const { code, data } = response.data;

			const receiver = req.body.email;
			const subject = "Forgot Password - Transcendence";
			const webPage = `
				<h2>Forgot Password - Your Pong Transcendence</h2>
				<p>Please, you need to inform the code below to change the password of your account</p>
				<p>The code is <strong>${code}</strong>. Type it in the verification page to validate it</p>
			`;
			await sendMail(receiver, subject, webPage);

			// Store code temporarily in global memory (similar to email verification)
			if (!global.resetCodes) {
				global.resetCodes = new Map();
			}
			global.resetCodes.set(req.body.email, {
				code: code,
				expires: Date.now() + 5 * 60 * 1000, // 5 minutes
			});

			return reply.code(200).send({ 
				success: ["Verification code sent to your email"], 
				error: [] 
			});

		} catch (err) {
			if (err?.response?.status === 404) {
				return reply.code(404).send({ 
					success: [], 
					error: ["User not found"] 
				});
			}
			return reply.code(500).send({ 
				success: [], 
				error: ["An error occurred while sending the verification code"] 
			});
		}
	},

	// API version of checkEmailCode that doesn't use sessions
	apiCheckEmailCode: async function apiCheckEmailCode(req, reply) {
		try {
			if (!req.body || !req.body.email || !req.body.code) {
				return reply.code(400).send({ 
					success: [], 
					error: ["Email and code are required"] 
				});
			}

			// Check stored code
			if (!global.resetCodes || !global.resetCodes.has(req.body.email)) {
				return reply.code(400).send({ 
					success: [], 
					error: ["No verification code found. Please request a new one."] 
				});
			}

			const storedData = global.resetCodes.get(req.body.email);
			
			// Check if code expired
			if (Date.now() > storedData.expires) {
				global.resetCodes.delete(req.body.email);
				return reply.code(400).send({ 
					success: [], 
					error: ["Verification code expired. Please request a new one."] 
				});
			}

			// Verify code (case-insensitive)
			if (req.body.code.toLowerCase() !== storedData.code.toLowerCase()) {
				return reply.code(400).send({ 
					success: [], 
					error: ["Invalid verification code"] 
				});
			}

			// Code is valid, clean up
			global.resetCodes.delete(req.body.email);

			return reply.code(200).send({ 
				success: ["Code verified successfully"], 
				error: [] 
			});

		} catch (err) {
			console.error("Error verifying reset code:", err);
			return reply.code(500).send({ 
				success: [], 
				error: ["An error occurred while verifying the code"] 
			});
		}
	},

	// API version of newPassword that doesn't use sessions
	apiNewPassword: async function apiNewPassword(req, reply) {
		try {
			if (!req.body || !req.body.email || !req.body.password || !req.body.confirmPassword) {
				return reply.code(400).send({ 
					success: [], 
					error: ["All fields are required"] 
				});
			}

			// Add email to the request body for auth-service
			req.body.new2FA = false; // Keep existing 2FA settings by default

			const response = await axios.post("http://auth-service:3001/newPassword", req.body);

			return reply.code(200).send({ 
				success: ["Password updated successfully"], 
				error: [] 
			});

		} catch (err) {
			if (err?.response?.status === 409) {
				return reply.code(400).send({ 
					success: [], 
					error: ["Cannot use the same password"] 
				});
			}
			return reply.code(500).send({ 
				success: [], 
				error: ["An error occurred while updating your password"] 
			});
		}
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
