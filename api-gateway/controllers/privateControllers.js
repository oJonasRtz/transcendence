import axios from 'axios';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/sendMail.js';
import speakeasy from 'speakeasy';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import { pipeline } from "stream/promises";
import { checkImageSafety } from '../utils/apiCheckImages.js';
import { fileTypeFromFile } from 'file-type';
import sharp from 'sharp';
import { MatchClient } from '../utils/MatchClient.class.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_IMAGE_PATH = "/app/public/images/default.jpg";
let inQueue = false;
const matchClient = new MatchClient('ws://new-match-service:3020');

const privateControllers = {

	goFlappyBird: function goFlappyBird(req, reply) {
		return reply.sendFile("flappy-bird/index.html");
	},

	goPong: function goPong(req, reply) {
		return reply.sendFile("pong/index.html");
	},

	match: async function match(req, reply) {
		return reply.view("matchMaking", {
			email: req.user.email,
			user_id: req.user.user_id,
		});
	},

	joinQueue: async function joinQueue(req, reply) {
		if (inQueue) {
			if (req.isApiRequest) {
				return reply.send({ success: [], error: ["Already in queue"] });
			}
			return reply.send("Already in queue");
		}

		const payload = {
			type: "ENQUEUE",
			email: req.user.email,
			user_id: req.user.user_id,
		};

		matchClient.send(payload);
		inQueue = true;
		console.log(`User ${req.user.email} joined the queue`);

		if (req.isApiRequest) {
			return reply.send({ success: ["Joined queue successfully"], error: [] });
		}
		return reply.send("Joined queue");
	},

	leaveQueue: async function leaveQueue(req, reply) {
		if (!inQueue) {
			if (req.isApiRequest) {
				return reply.send({ success: [], error: ["Not in queue"] });
			}
			return reply.send("Not in queue");
		}

		const payload = {
			type: "DEQUEUE",
			email: req.user.email,
			user_id: req.user.user_id,
		};
		matchClient.send(payload);
		inQueue = false;
		console.log(`User ${req.user.email} left the queue`);

		if (req.isApiRequest) {
			return reply.send({ success: ["Left queue successfully"], error: [] });
		}
		return reply.send("Left queue");
	},

	helloDb: async function testPrivateRoute(req, reply) {
                try {
                        const result = await axios.get("http://auth-service:3001/helloDb");
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

			//get the user's avatar
			
			const response = await axios.post("http://users-service:3003/getUserAvatar", { user_id: req.user.user_id, email: req.user.email });
			let avatar = response?.data.avatar;

			/*if (avatar === '/public/images/default.jpg') {
				try {
					await fs.access(`/app/public/uploads/avatar_${req.user.user_id}.png`);
				} catch (err) {
					 await mkdir("/app/public/uploads", { recursive: true });
					 await sharp(BASE_IMAGE_PATH)
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
                		.toFile(`/app/public/uploads/avatar_${req.user.user_id}.png`);
				}
				avatar = `/public/uploads/avatar_${req.user.user_id}.png`;
				await axios.post("http://users-service:3003/setUserAvatar", { user_id: req.user.user_id, avatar: avatar });
			}*/

			const myData = await axios.post("http://users-service:3003/getUserInformation", { user_id: req.user.user_id });

			const data = myData?.data;

			return reply.view("home", { username, success, data, avatar, error } );
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

		try {
			await axios.post("http://users-service:3003/setIsOnline", req.user);

			await req.session.destroy();

			reply.clearCookie("jwt");
			reply.clearCookie("session");

			await axios.post("http://auth-service:3001/set2FAValidate", { email: decoded.email, signal: false });
		} catch (err) { console.error("API-GATEWAY logout ERROR:", err?.response.data || err.message) };

		return reply.redirect("/login");
	},

	confirmUserEmail: async function confirmUserEmail(req, reply) {
		try {
			const token = req.cookies.jwt;
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const email = decoded.email;

			const response = await axios.get("http://auth-service:3001/getCaptcha");
			const { code, data } = response.data;

			delete req.session.captcha;
			delete req.session.captchaExpires;

			req.session.captcha = code;
			req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

			// For API requests, also store in a server-side map keyed by user_id
			// This allows verification across different sessions (Next.js API calls)
			if (req.isApiRequest) {
				if (!global.emailVerificationCodes) {
					global.emailVerificationCodes = new Map();
				}
				global.emailVerificationCodes.set(req.user.user_id, {
					code,
					expires: Date.now() + 5 * 60 * 1000
				});
			}

			const receiver = email;
			const subject = "Confirm your e-mail, Transcendence Pong";
			const webPage = `
				<h2>Confirm your e-mail</h2>
				<p>Congratulations! Confirming your e-mail is a great choice to recover your password easily later</p>
				<p> Your code is <strong>${code}</strong>. Please inform it to us. See you =D</p>
			`;

			await sendMail(receiver, subject, webPage);

			// API Request: Return JSON response
			if (req.isApiRequest) {
				return reply.send({ 
					success: ['Verification code sent to your email'], 
					error: [] 
				});
			}

			return reply.redirect("/confirmUserEmailCode");
		} catch (err) {
			delete req.session.captcha;
			delete req.session.captchaExpires;

			const errorMsg = err.response?.status === 401 
				? "Invalid code" 
				: "Unexpected error happened";
			const error = [errorMsg];

			// API Request: Return JSON error
			if (req.isApiRequest) {
				return reply.code(500).send({ success: [], error });
			}

			req.session.error = error;
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
				const error = ["You need to follow step by step"];
				
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				
				req.session.error = error;
				return reply.redirect("/confirmUserEmailCode");
			}
			
			// For API requests, validate against global store
			if (req.isApiRequest) {
				const stored = global.emailVerificationCodes?.get(req.user.user_id);
				
				if (!stored) {
					return reply.code(400).send({ 
						success: [], 
						error: ["Please request a verification code first"] 
					});
				}
				
				if (Date.now() > stored.expires) {
					global.emailVerificationCodes.delete(req.user.user_id);
					return reply.code(400).send({ 
						success: [], 
						error: ["Verification code has expired. Please request a new one."] 
					});
				}
				
				if (stored.code !== req.body.captchaInput) {
					return reply.code(400).send({ 
						success: [], 
						error: ["Invalid verification code"] 
					});
				}
				
				// Code is valid, clean up and proceed
				global.emailVerificationCodes.delete(req.user.user_id);
			}
			// For EJS requests, the validatorHook handles session-based validation

			await axios.post("http://users-service:3003/validateUserEmail", { email: req.user.email, user_id: req.user.user_id });

			const success = ["Your e-mail is validated now =D"];
			
			// API Request: Return JSON response
			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}

			req.session.success = success;
			return reply.redirect("/home");
		} catch (err) {
			console.error("VALIDATE USER EMAIL CODE API-GATEWAY:", err);
			const error = ["An error happened trying to validating your code"];
			
			// API Request: Return JSON error
			if (req.isApiRequest) {
				return reply.code(500).send({ success: [], error });
			}

			req.session.error = error;
			return reply.redirect("/confirmUserEmailCode");
		}
	},

	get2FAQrCode: async function get2FAQrCode(req, reply) {
		try {
			const token = req.cookies.jwt;
			const decoded = await jwt.verify(token, process.env.JWT_SECRET);
			const res = await axios.post("http://auth-service:3001/get2FAEnable", { email: decoded.email });
			if (!res.data.twoFactorEnable) {
				const error = ["You do not have 2FA activated at the moment"];
				
				// API Request: Return JSON error
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				
				req.session.error = error;
				return reply.redirect("/home");
			}
			const response = await axios.post("http://auth-service:3001/get2FAQrCode", { email: decoded.email });
			if (response.data.qrCodeDataURL == null && response.data.image == null) {
				const error = ["Error generating the qrCode"];
				
				// API Request: Return JSON error
				if (req.isApiRequest) {
					return reply.code(500).send({ success: [], error });
				}
				
				return reply.code(500).send("Error generating the qrCode");
			}

			const qrCodeDataURL = response.data.qrCodeDataURL;
			const image = response.data.image;

			// API Request: Return QR code directly
			if (req.isApiRequest) {
				return reply.send({ 
					success: ['QR code generated successfully'], 
					error: [],
					qrCodeDataURL,
					image
				});
			}

			req.session.qrCodeDataURL = qrCodeDataURL;
			req.session.image = image;
			return reply.redirect("/check2FAQrCode");
		} catch (err) {
			console.error("get2FAQrCode");
			const error = ["Error getting get2FAQrCode"];
			
			// API Request: Return JSON error
			if (req.isApiRequest) {
				return reply.code(500).send({ success: [], error });
			}
			
			req.session.error = error;
			return reply.redirect("/home");
		}
	},

	check2FAQrCode: async function check2FAQrCode(req, reply) {
		const isValidate = await axios.post("http://auth-service:3001/get2FAValidate", { email: req.user.email });
		if (isValidate?.data.twoFactorValidate) {
			req.session.success = ["You already done the 2FA :)"];
			return reply.redirect("/home");
		}

		if (req.session.qrCodeDataURL == null && req.session.image == null) {
			req.session.error = ["You need to follow step by step"];
			return reply.redirect("/home");
		}
		const qrCodeDataURL = req.session.qrCodeDataURL ?? null;
		const image = req.session.image ?? null;

		const error = req.session.error || [];
		delete req.session.error;
		req.session.canValidate = true;
		return reply.view("check2FAQrCode", { qrCodeDataURL, image, error } );
	},

	validate2FAQrCode: async function validate2FAQrCode(req, reply) {
		try {
			if (!req.session.canValidate && !req.isApiRequest) {
				req.session.error = ["You need to follow step by step"];
				delete req.session.canValidate;
				return reply.redirect("/home");
			}
			if (!req.body || !req.body.code) {
				const error = ["You need to provide a code"];
				
				// API Request: Return JSON error
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				
				req.session.error = error;
				return reply.redirect("/check2FAQrCode");
			}
			const token = req.cookies.jwt;
			const decoded = await jwt.verify(token, process.env.JWT_SECRET);
			const response = await axios.post("http://auth-service:3001/get2FASecret", { email: decoded.email });
			if (!response.data.twoFactorSecret) {
				const error = ["You cannot have 2FA activate"];
				
				// API Request: Return JSON error
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				
				req.session.error = error;
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
				const error = ["The code is incorrect. Try again"];
				
				// API Request: Return JSON error
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				
				req.session.error = error;
				return reply.redirect("/check2FAQrCode");
			}
			
			const success = ["2FA passed successfully"];
			await axios.post("http://auth-service:3001/set2FAValidate", { email: decoded.email, signal: true });
			
			// API Request: Return JSON response
			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}
			
			req.session.success = success;
			return reply.redirect("/home");
		} catch (err) {
			console.error("Validate2FAQrCode Api-Gateway", err);
			const error = ["An error happened trying to validate your 2FA Code"];
			
			// API Request: Return JSON error
			if (req.isApiRequest) {
				return reply.code(500).send({ success: [], error });
			}
			
			req.session.error = error;
			return reply.redirect("/home");
		}
	},

	upload: async function upload(req, reply) {
		try {
			const file = await req.file();

			if (!file) {
				const error = ["You need to send an image"];
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/home");
			}

			const uploadDir = path.join(__dirname, "..", "public", "uploads");

			await mkdir(uploadDir, { recursive: true });

			const allowed_extensions = [".png", ".webp", ".jpg", ".jpeg"];

			const user_id = req.user.user_id;
			const ext = path.extname(file.filename);

			if (!allowed_extensions.includes(ext)) {
				const error = ["Forbidden extension detected"];
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/home");
			}

			// temporary file to check nsfw and also format it

			const filePath = path.join(uploadDir, `avatar_${user_id}.tmp`);

			await pipeline(file.file, fs.createWriteStream(filePath));

			const type = await fileTypeFromFile(filePath);

			if (!type || !type.mime.startsWith("image/")) {
				await unlink(filePath);
				const error = ["The file is not a valid image"];
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/home");
			}

			// api check starts here and erase the temporary file if fails
			const response = await checkImageSafety(filePath);

			// Innapropriate image
			if (response.nsfw) {
				await unlink(filePath); // destroy the innapropriate file
				const error = ["Innapropriate image detected! Be careful choosing images!"];
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/home");
			}

			// Corrupted image
			if (response.isError) {
				await unlink(filePath);
				const error = ["Invalid image"];
				if (req.isApiRequest) {
					return reply.code(400).send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/home");
			}

			const avatarFile = path.join(uploadDir, `avatar_${user_id}.png`);

			// svg starts here and erase the temporary file, setting the new in the database, redirecting to the users' home

			await sharp(filePath)
                        .resize(350, 350)
                        .png()
                        .composite([{
                                input: Buffer.from(
                                        `<svg><circle cx="175" cy="175" r="175"/></svg>`
                                ),
                                blend: "dest-in"
                        }])
                        .toFile(avatarFile);

			// erase the last temporary file

			await unlink(filePath);

			const avatarDb = `/public/uploads/avatar_${user_id}.png`;
			await axios.post("http://users-service:3003/setUserAvatar", { user_id: req.user.user_id, avatar: avatarDb });

			const success = ["Upload successfully"];

			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}

			req.session.success = success;
			return reply.redirect("/home");
		} catch (err) {

			try { await unlink(`/app/public/uploads/avatar_${req.user.user_id}.tmp`) } catch {};

			console.error("API-GATEWAY upload error:", err);
			const error = ["Error in the upload process"];

			if (req.isApiRequest) {
				return reply.code(500).send({ success: [], error });
			}

			req.session.error = error;
			return reply.redirect("/home");
		}
	},

	changeUsername: async function changeUsername(req, reply) {
		const success = req.session.success ?? [];
		const error = req.session.error ?? [];

		delete req.session.success;
		delete req.session.error;

		return reply.view("changeUsername", { success, error } );
	},

	changeNickname: async function changeNickname(req, reply) {
		const success = req.session.success ?? [];
		const error = req.session.error ?? [];

		delete req.session.success;
		delete req.session.error;
		
		return reply.view("changeNickname", { success, error } );
	},

	changeEmail: async function changeEmail(req, reply) {
		const success = req.session.success ?? [];
		const error = req.session.error ?? [];

		delete req.session.success;
		delete req.session.error;

		return reply.view("changeEmail", { success, error } );
	},

	changeDescription: async function changeDescription(req, reply) {
		const success = req.session.success ?? [];
		const error = req.session.error ?? [];

		delete req.session.success;
		delete req.session.error;

		return reply.view("changeDescription", { success, error } );
	},

	setUserDescription: async function setUserDescription(req, reply) {
		try {
			if (!req.body || !req.body.description) {
				const error = ["You need to fill all information"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeDescription");
			}
			req.body.user_id = req.user.user_id;
			await axios.post("http://users-service:3003/setUserDescription", req.body);
			const success = ["Description changed successfully"];

			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}

			req.session.success = success;
			return reply.redirect("/home");
		} catch (err) {
			console.error("API-GATEWAY setUserDescription Error:", err);
			const error = ["Error setting your new description"];
			if (req.isApiRequest) {
				return reply.send({ success: [], error });
			}
			req.session.error = error;
			return reply.redirect("/changeDescription");
		}
	},

	changePassword: async function changePassword(req, reply) {
		const success = req.session.success ?? [];
		const error = req.session.error ?? [];

		delete req.session.success;
		delete req.session.error;

		return reply.view("changePassword", { success, error } );
	},

	setAuthPassword: async function setAuthPassword(req, reply) {
		try {
			if (!req.body || !req.body.password || !req.body.confirmPassword || !req.body.currentPassword) {
				const error = ["You need to fill all input boxes"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeYourPassword");
			}
			if (req.body.confirmPassword !== req.body.password) {
				const error = ["Password mismatch"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeYourPassword");
			}

			req.body.user_id = req.user.user_id;
			req.body.email = req.user.email;

			await axios.post("http://auth-service:3001/setAuthPassword", req.body);
			const success = ["Password changed successfully"];

			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}

			req.session.success = success;
			return reply.redirect("/home");
		} catch (err) {
			if (err?.response?.status === 400) {
				const error = ["You cannot change to the same password you have now"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changePassword");
			}
			console.error("setAuthPassword Api-gateway error:", err);
			const error = ["Error trying to change your password"];
			if (req.isApiRequest) {
				return reply.send({ success: [], error });
			}
			req.session.error = error;
			return reply.redirect("/home");
		}
	},

	setAuthEmail: async function setAuthEmail(req, reply) {
		try {
			if (!req.body || !req.body.email) {
				const error = ["You need to fill everything"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeEmail");
			}

			req.body.user_id = req.user.user_id;
                        req.body.username = req.user.username;

                        await axios.post("http://auth-service:3001/setAuthEmail", req.body);

			// Reset email verification when email changes
			try {
				await axios.post("http://users-service:3003/resetEmailVerification", { 
					user_id: req.user.user_id 
				});
			} catch (resetErr) {
				console.error("Error resetting email verification:", resetErr?.response?.data || resetErr.message);
			}

			// Disable 2FA when email changes (for security)
			try {
				await axios.post("http://auth-service:3001/disable2FA", { 
					user_id: req.user.user_id 
				});
			} catch (disable2FAErr) {
				console.error("Error disabling 2FA:", disable2FAErr?.response?.data || disable2FAErr.message);
			}

                        const success = [
				"Email changed successfully",
				"Email verification has been reset",
				"Two-Factor Authentication has been disabled for security"
			];

                        const response = await axios.post("http://auth-service:3001/createNewToken", req.body);

                        const token = response?.data.token;

                        if (!token) {
				const error = ["Error recreating the jwt"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
                                req.session.error = error;
                                return reply.redirect("/home");
                        }

                        const isProduction = process.env.NODE_ENV === "production";

                        reply.setCookie("jwt", token, {
                                httpOnly: true,
                                secure: isProduction,
                                path: "/",
                                sameSite: "strict",
                                maxAge: 60 * 60 * 1000 // 1h
                        });

			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}

			req.session.success = success;
                        return reply.redirect("/home");

                } catch (err) {
                        console.error("API-GATEWAY setAuthEmail error:", err);
			const error = ["Error trying to change your email"];
			if (req.isApiRequest) {
				return reply.send({ success: [], error });
			}
                        req.session.error = error;
                        return reply.redirect("/changeEmail");
                }
	},

	setAuthNickname: async function setAuthNickname(req, reply) {
		try {
			if (!req.body || !req.body.nickname) {
				const error = ["You need to fill everything"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeNickname");
			}
			req.body.user_id = req.user.user_id;
                        req.body.email = req.user.email;
			req.body.username = req.user.username;

			if (req.body.nickname.toLowerCase() === "system")
				throw new Error ("You cannot use that nickname");

                        await axios.post("http://auth-service:3001/setAuthNickname", req.body);

                        const success = ["Nickname changed successfully"];

                        const response = await axios.post("http://auth-service:3001/createNewToken", req.body);

                        const token = response?.data.token;

                        if (!token) {
				const error = ["Error recreating the jwt"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
                                req.session.error = error;
                                return reply.redirect("/home");
                        }

                        const isProduction = process.env.NODE_ENV === "production";

                        reply.setCookie("jwt", token, {
                                httpOnly: true,
                                secure: isProduction,
                                path: "/",
                                sameSite: "strict",
                                maxAge: 60 * 60 * 1000 // 1h
                        });

			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}

			req.session.success = success;
                        return reply.redirect("/home");

		} catch (err) {
			if (err.message === "You cannot use that nickname") {
				const error = ["Forbidden nickname"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeNickname");
			}
			console.error("API-GATEWAY setAuthNickname error:", err);
			const error = ["Error trying to change your nickname"];
			if (req.isApiRequest) {
				return reply.send({ success: [], error });
			}
			req.session.error = error;
			return reply.redirect("/home");
		}
	},

	setAuthUsername: async function setAuthUsername(req, reply) {
		try {
			if (!req.body || !req.body.username) {
				const error = ["You need to fill everything"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeUsername");
			}

			req.body.user_id = req.user.user_id;
			req.body.email = req.user.email;

			if (req.body.username.toLowerCase() === "system")
				throw new Error("You cannot use that username");

			await axios.post("http://auth-service:3001/setAuthUsername", req.body);

			const success = ["Username changed successfully"];

			const response = await axios.post("http://auth-service:3001/createNewToken", req.body);

			const token = response?.data.token;

			if (!token) {
				const error = ["Error recreating the jwt"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/home");
			}

			const isProduction = process.env.NODE_ENV === "production";

                        reply.setCookie("jwt", token, {
                                httpOnly: true,
                                secure: isProduction,
                                path: "/",
                                sameSite: "strict",
                                maxAge: 60 * 60 * 1000 // 1h
                        });

			if (req.isApiRequest) {
				return reply.send({ success, error: [] });
			}

			req.session.success = success;
			return reply.redirect("/home");
		} catch (err) {
			if (err.message === "You cannot use that username") {
				const error = ["Forbidden username"];
				if (req.isApiRequest) {
					return reply.send({ success: [], error });
				}
				req.session.error = error;
				return reply.redirect("/changeUsername");
			}
			console.error("Api-Gateway setAuthUsername:", err);
			const error = ["Error during setting your new username"];
			if (req.isApiRequest) {
				return reply.send({ success: [], error });
			}
			req.session.error = error;
			return reply.redirect("/changeUsername");
		}
	},

	seeAllUsers: async function seeAllUsers(req, reply) {
		try {
			const success = req.session.success ?? [];
			const error = req.session.error ?? [];

			delete req.session.success;
			delete req.session.error;

			const response = await axios.get("http://users-service:3003/getAllUsersInformation");

			const users = response?.data ?? [];

			return reply.view("seeAllUsers", { success, error, users });
		} catch (err) {
			console.error("API-GATEWAY seeAllUsers:", err);
			req.session.error = ["Error opening the page to see all users"];
			return reply.redirect("/home");
		}
	},

	seeProfile: async function seeProfile(req, reply) {
		try {
			const { user } = req.query;
			const response = await axios.post("http://users-service:3003/getDataByPublicId", { public_id: user });
			const data = response?.data;

			// Return JSON for API requests (Next.js frontend)
			if (req.isApiRequest) {
				return reply.send(data);
			}

			// Return HTML view for traditional requests
			return reply.view("publicProfile", { data } );
		} catch (err) {
			console.error("API-GATEWAY seeProfile Error:", err);

			if (req.isApiRequest) {
				return reply.code(500).send({ error: "Error fetching user profile" });
			}

			req.session.error = ["Error trying to see the profile of the target user"];
			return reply.redirect("/home");
		}
	},

	chatAllUsers: async function chatAllUsers(req, reply) {
		try {
			const response = await axios.post("http://users-service:3003/getUserInformation", { user_id: req.user.user_id });
			return reply.view("chatAllUsers", { public_id: response?.data.public_id, username: req.user.username } );
		} catch (err) {
			console.error("API-GATEWAY chatAllUsers:", err);
			req.session.error = ["Error opening the chat"];
			return reply.redirect("/home");
		}
	},

	deleteUserAccount: async function deleteUserAccount(req, reply) {
		try {
			await axios.post("http://auth-service:3001/deleteUserAccount", { user_id: req.user.user_id });
			await req.session.destroy();

			reply.clearCookie("jwt");
                	reply.clearCookie("session");

			console.log("The account was successfully deleted");
			return reply.redirect("/login");
		} catch (err) {
			console.error("API-GATEWAY deleteUserAccount ERROR:", err);
			return reply.redirect("/login");
		}
	},

	blockTheUser: async function blockUserAccount(req, reply) {
		try {
			if (!req.body || !req.body.public_id) {
				req.session.error = ["An error happened trying to block the user"];
				return reply.redirect("/home");
			}
			req.body.user_id = req.user.user_id;
			const response = await axios.post("http://users-service:3003/blockTheUser", req.body);
			if (response?.status === 201)
				req.session.success = ["Target blocked"];
			else
				req.session.success = ["Target user unblocked"];
			return reply.redirect("/home");
		} catch (err) {
			if (err?.response?.status === 403 || err?.response?.message === "SAME_USER") {
				req.session.error = ["You cannot block yourself"];
				return reply.redirect("/home");
			}
			console.error("API-GATEWAY blockTheUser");
			req.session.error = ["Error trying to block the user"];
			return reply.redirect("/home");
		}
	},

	friendInvite: async function friendInvite(req, reply) {
		try {
			if (!req.body || !req.body.public_id) {
				req.session.error = ["An error happened trying to invite the user"];
				return reply.redirect("/home");
			}
			req.body.user_id = req.user.user_id;
			const response = await axios.post("http://users-service:3003/friendInvite", req.body);
			if (response?.status === 201)
				req.session.success = ["Friend request sent successfully"];
			else
				req.session.success = ["You already sent the request, do not need another :)"];
			return reply.redirect("/home");
		} catch (err) {
			if (err?.response?.data === "SAME_USER" || err?.response?.status === 403) {
				req.session.error = ["You cannot invite yourself as a friend"];
				return reply.redirect("/home");
			}
			console.error("API-GATEWAY friendInvite ERROR:", err);
			req.session.error = ["An error happened inviting the user as a friend"];
			return reply.redirect("/home");
		}
	},

	handlerFriendsPage: async function handlerFriendsPage(req, reply) {
		let success = req.session.success ?? [];
		let error = req.session.error ?? [];

		delete req.session.success;
		delete req.session.error;

		try {
			const response_friends = await axios.post("http://users-service:3003/getAllFriends", { user_id: req.user.user_id });
			const response_pendencies = await axios.post("http://users-service:3003/getAllPendencies", { user_id: req.user.user_id });

			return reply.view("handlerFriendsPage", { success, error, friends: response_friends?.data ?? [], pendings: response_pendencies?.data ?? [] });
		} catch (err) {
			console.error("API-GATEWAY handlerFriendsPage ERROR:", err);
			req.session.error = ["Error trying to opening the handlerFriendsPage"];
			return reply.redirect("/home");
		}
	},

	setAcceptFriend: async function setAcceptFriend(req, reply) {
		try {
			if (!req.body || !req.body.public_id) {
				req.session.error = ["Invalid action"];
				return reply.redirect("/handlerFriendsPage");
			}
			req.body.user_id = req.user.user_id;
			req.body.accept = true;
			await axios.post("http://users-service:3003/setAcceptFriend", req.body);
			req.session.success = ["Friend added successfully"];
			return reply.redirect("/handlerFriendsPage");
		} catch (err) {
			console.error("API-GATEWAY setAcceptFriend ERROR:", err);
			req.session.error = ["An error happened trying to accept that person"];
			return reply.redirect("/handlerFriendsPage");
		}
	},

	deleteAFriend: async function deleteAFriend(req, reply) {
		try {
			if (!req.body || !req.body.public_id) {
				req.session.error = ["Invalid action"];
				return reply.redirect("/handlerFriendsPage");
			}
			req.body.user_id = req.user.user_id;
			await axios.post("http://users-service:3003/deleteAFriend", req.body);
			req.session.success = ["User relation deleted successfully"];
			return reply.redirect("/handlerFriendsPage");
		} catch (err) {
			console.error("API-GATEWAY deleteAFriend ERROR:", err);
			req.session.error = ["An error happened trying to delete that person friendship"];
			return reply.redirect("/handlerFriendsPage");
		}
	},

	directMessage: async function directMessages(req, reply) {
                try {
			if (!req.query || !req.query.public_id) {
				req.session.error = ["Error opening direct Messages Page"];
				return reply.redirect("/home");
			}

			const response = await axios.post("http://users-service:3003/getUserInformation", { user_id: req.user.user_id });
                        return reply.view("chatDirectUsers", { target_id: req.query.public_id } );
                } catch (err) {
                        console.error("API-GATEWAY chatAllUsers ERROR:", err);
                        req.session.error = ["Error opening the chat"];
                        return reply.redirect("/home");
                }
        },

	set2FAOnOff: async function set2FAOnOff(req, reply) {
                try {
                        const result = await axios.post("http://auth-service:3001/set2FAOnOff", { user_id: req.user.user_id });
                        const success = [];
                        let enabled = false;
                        
                        if (result?.data.message === "2FA_ENABLED") {
                                success.push("2FA enabled successfully");
                                enabled = true;
                        } else if (result?.data.message === "2FA_DISABLED") {
                                success.push("2FA disabled successfully");
                                enabled = false;
                        }
                        
                        // API Request: Return JSON response
                        if (req.isApiRequest) {
                                return reply.send({ 
                                        success, 
                                        error: [],
                                        enabled,
                                        message: result?.data.message
                                });
                        }
                        
                        req.session.success = success;
                        return reply.redirect("/home");
                } catch (err) {
                        console.error("API-GATEWAY set2FAOnOff");
                        const error = ["Error setting the new status of 2FA"];
                        
                        // API Request: Return JSON error
                        if (req.isApiRequest) {
                                return reply.code(500).send({ success: [], error });
                        }
                        
                        req.session.error = error;
                        return reply.redirect("/home");
                }
        },

	getVerificationStatus: async function getVerificationStatus(req, reply) {
		try {
			// Get user's email verification status
			const userInfoResponse = await axios.post("http://users-service:3003/getUserInformation", { 
				user_id: req.user.user_id 
			});
			
			// Get user's 2FA status
			const twoFactorResponse = await axios.post("http://auth-service:3001/get2FAEnable", { 
				email: req.user.email 
			});
			
			return reply.send({
				success: ['Status retrieved successfully'],
				error: [],
				isEmailVerified: userInfoResponse?.data?.isEmailConfirmed || false,
				has2FA: twoFactorResponse?.data?.twoFactorEnable || false,
			});
		} catch (err) {
			console.error("API-GATEWAY getVerificationStatus ERROR:", err);
			return reply.code(500).send({
				success: [],
				error: ['Error retrieving verification status'],
				isEmailVerified: false,
				has2FA: false,
			});
		}
	}
};

export default privateControllers;
