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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_AVATAR_PATH = "/app/public/images/default_avatar.png";
const BASE_IMAGE_PATH = "/app/public/images/default.jpg";

const privateControllers = {

	match: async function match(req, reply) {
		const ip = fs.readFileSync('/app/shared/server.ip', 'utf-8').trim();

		console.log("ip: ", ip);
		return reply.view("matchMaking", {
			email: req.user.email,
			user_id: req.user.user_id,
			ws_host: ip,
		});
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
			
			console.log("user_id home:", req.user.user_id)
			const response = await axios.post("http://users-service:3003/getUserAvatar", { user_id: req.user.user_id, email: req.user.email });
			let avatar = response?.data.avatar;

			if (avatar === '/public/images/default.jpg') {
				try {
					await fs.access(DEFAULT_AVATAR_PATH);
				} catch (err) {
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
                		.toFile(DEFAULT_AVATAR_PATH);
				}			
				avatar = "/public/images/default_avatar.png";
			}

			//get the user's status
			const isOnline = req.user.isOnline;

			const myData = await axios.post("http://users-service:3003/getUserInformation", { user_id: req.user.user_id });

			const data = myData?.data;

			console.log("data:", data);

			await axios.post("http://users-service:3003/setIsOnline", req.user);

			return reply.view("home", { username, success, data, avatar, error, isOnline } );
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

		await axios.post("http://users-service:3003/setIsOnline", req.user);

		await req.session.destroy();

		reply.clearCookie("jwt");
		reply.clearCookie("session");

		await axios.post("http://auth-service:3001/set2FAValidate", { email: decoded.email, signal: false });
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

			await axios.post("http://users-service:3003/validateUserEmail", { email: decoded.email });

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
			const res = await axios.post("http://auth-service:3001/get2FAEnable", { email: decoded.email });
			if (!res.data.twoFactorEnable) {
				req.session.error = ["You do not have 2FA activated at the moment"];
				return reply.redirect("/home");
			}
			const response = await axios.post("http://auth-service:3001/get2FAQrCode", { email: decoded.email });
			if (response.data.qrCodeDataURL == null && response.data.image == null) {
				return reply.code(500).send("Error generating the qrCode");
			}

			const qrCodeDataURL = response.data.qrCodeDataURL;
			const image = response.data.image;

			req.session.qrCodeDataURL = qrCodeDataURL;
			req.session.image = image;
			return reply.redirect("/check2FAQrCode");
		} catch (err) {
			console.error("get2FAQrCode");
			req.session.error = ["Error getting get2FAQrCode"];
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
			console.error("Entrei aqui check2FAQrCode auth");
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
			const response = await axios.post("http://auth-service:3001/get2FASecret", { email: decoded.email });
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
			await axios.post("http://auth-service:3001/set2FAValidate", { email: decoded.email, signal: true });
			return reply.redirect("/home");
		} catch (err) {
			console.error("Validate2FAQrCode Api-Gateway", err);
			req.session.error = ["An error happened trying to validate your 2FA Code"];
			return reply.redirect("/home");
		}
	},

	upload: async function upload(req, reply) {
		try {
			const file = await req.file();

			if (!file) {
				req.session.error = ["You need to send an image"];
				return reply.redirect("/home");
			}

			const uploadDir = path.join(__dirname, "..", "public", "uploads");

			await mkdir(uploadDir, { recursive: true });

			const allowed_extensions = [".png", ".webp", ".jpg", ".jpeg"];

			const user_id = req.user.user_id;
			const ext = path.extname(file.filename);

			if (!allowed_extensions.includes(ext)) {
				req.session.error = ["Forbidden extension detected"];
				return reply.redirect("/home");
			}

			// temporary file to check nsfw and also format it

			const filePath = path.join(uploadDir, `avatar_${user_id}.tmp`);

			await pipeline(file.file, fs.createWriteStream(filePath));

			const type = await fileTypeFromFile(filePath);

			if (!type || !type.mime.startsWith("image/")) {
				await unlink(filePath);
				req.session.error = ["The file is not a valid image"];
				return reply.redirect("/home");
			}

			// api check starts here and erase the temporary file if fails
			const response = await checkImageSafety(filePath);

			// Innapropriate image
			if (response.nsfw) {
				await unlink(filePath); // destroy the innapropriate file
				req.session.error = ["Innapropriate image detected! Be careful choosing images!"];
				return reply.redirect("/home");
			}

			// Corrupted image
			if (response.isError) {
				req.session.error = ["Invalid image"];
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

			req.session.success = ["Upload successfully"];
			return reply.redirect("/home");
		} catch (err) {
	
			try { await unlink(`/app/public/uploads/avatar_${req.user.user_id}.tmp`) } catch {};

			console.error("API-GATEWAY upload error:", err);
			req.session.error = ["Error in the upload process"];
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
				req.session.error = ["You need to fill all information"];
				return reply.redirect("/changeDescription");
			}
			req.body.user_id = req.user.user_id;
			await axios.post("http://users-service:3003/setUserDescription", req.body);
			req.session.success = ["Description changed successfully"];
			return reply.redirect("/home");
		} catch (err) {
			console.error("API-GATEWAY setUserDescription Error:", err);
			req.session.error = ["Error setting your new description"];
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
			if (!req.body || !req.body.password || !req.body.confirmPassword) {
				req.session.error = ["You need to fill all input boxes"];
				return reply.redirect("/changeYourPassword");
			}
			if (req.body.confirmPassword !== req.body.password) {
				req.session.error = ["Password mismatch"];
				return reply.redirect("/changeYourPassword");
			}

			req.body.user_id = req.user.user_id;
			req.body.email = req.user.email;

			await axios.post("http://auth-service:3001/setAuthPassword", req.body);
			req.session.success = ["Password changed"];
			return reply.redirect("/home");
		} catch (err) {
			if (err?.response.status === 400) {
				req.session.error = ["You cannot change to the same password you have now"];
				return reply.redirect("/home");
			}
			console.error("setAuthPassword Api-gateway error:", err);
			req.session.error = ["Error trying to change your password"];
			return reply.redirect("/home");
		}
	},

	setAuthEmail: async function setAuthEmail(req, reply) {
		try {
			if (!req.body || !req.body.email) { 
				req.session.error = ["You need to fill everything"];
				return reply.redirect("/changeEmail");
			}

			req.body.user_id = req.user.user_id;
                        req.body.username = req.user.username;

                        await axios.post("http://auth-service:3001/setAuthEmail", req.body);

                        req.session.success = ["Email changed successfully"];

                        const response = await axios.post("http://auth-service:3001/createNewToken", req.body);

                        const token = response?.data.token;

                        if (!token) {
                                req.session.error = ["Error recreating the jwt"];
                                return reply.redirect("/home");
                        }

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
                        console.error("API-GATEWAY setAuthEmail error:", err);
                        req.session.error = ["Error trying to change your nickname"];
                        return reply.redirect("/home");
                }
	},

	setAuthNickname: async function setAuthNickname(req, reply) {
		try {
			if (!req.body || !req.body.nickname) {
				req.session.error = ["You need to fill everything"];
				return reply.redirect("/changeNickname");
			}
			req.body.user_id = req.user.user_id;
                        req.body.email = req.user.email;
			req.body.username = req.user.username;

                        await axios.post("http://auth-service:3001/setAuthNickname", req.body);

                        req.session.success = ["Nickname changed successfully"];

                        const response = await axios.post("http://auth-service:3001/createNewToken", req.body);

                        const token = response?.data.token;

                        if (!token) {
                                req.session.error = ["Error recreating the jwt"];
                                return reply.redirect("/home");
                        }

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
			console.error("API-GATEWAY setAuthNickname error:", err);
			req.session.error = ["Error trying to change your nickname"];
			return reply.redirect("/home");
		}
	},

	setAuthUsername: async function setAuthUsername(req, reply) {
		try {
			if (!req.body || !req.body.username) {
				req.session.error = ["You need to fill everything"];
				return reply.redirect("/changeUsername");
			}

			req.body.user_id = req.user.user_id;
			req.body.email = req.user.email;

			await axios.post("http://auth-service:3001/setAuthUsername", req.body);

			req.session.success = ["Username changed successfully"];

			const response = await axios.post("http://auth-service:3001/createNewToken", req.body);

			const token = response?.data.token;

			if (!token) {
				req.session.error = ["Error recreating the jwt"];
				return reply.redirect("/home");
			}

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
			console.error("Api-Gateway setAuthUsername:", err);
			req.session.error = ["Error during setting your new username"];
			return reply.redirect("/changeUsername");
		}
	}
};

export default privateControllers;
