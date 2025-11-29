import axios from 'axios';
import jwt from 'jsonwebtoken';
import { checkNameSecurity } from '../utils/apiCheckUsername.js';
import { Filter } from 'bad-words';
import fs from 'fs';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;

// export async function validatorHook(req, reply) {
// 	let error = [];
// 	let success = [];

// 	if (req.body && req.body.password) {
// 		if (!passwordRegex.test(req.body.password))
// 			error.push("Password must have numbers, letters, special characters");
	
// 		if (req.body.password.length < 8)
// 			error.push("Password must contain eight or more characters");

// 		if (req.url !== '/checkLogin') {
// 			if (!req.body.confirmPassword || req.body.confirmPassword !== req.body.password)
// 				error.push("Password Mismatch");
// 		}
// 	}

// 	if (req.body && req.body.captchaInput) {
// 		if (req.session.captcha !== req.body.captchaInput)
// 			error.push("Invalid captcha code, try again");
// 		if (req.url === '/checkEmailCode') {
// 			if (req.session.captcha !== req.body.captchaInput) {
// 				req.session.error = ["Invalid Validation Code"];
// 				return reply.redirect('/validateEmailCode');
// 			}
// 		}
// 	}

// 	if (req.body && req.body.email) {
// 		if (!emailRegex.test(req.body.email))
// 			error.push("Invalid e-mail");
// 	}

// 	if (req.body && req.body.username) {
// 		if (!usernameRegex.test(req.body.username) || req.body.username.length < 3)
// 			error.push("Invalid username");
// 	}

// 	if (req.body && req.body.nickname) {
// 		if (!usernameRegex.test(req.body.nickname) || req.body.nickname.length < 3)
// 			error.push("Invalid nickname");
// 	}

// 	if (error.length !== 0) {
// 		req.session.success = success;
// 		req.session.error = error;
// 		if (req.url === '/checkRegister') {
// 			return reply.redirect("/register");
// 		}
// 		else if (req.url === '/checkLogin')
// 			return reply.redirect("/login");
// 	}

// 	return ;
// };

const redirect = {
	'/checkRegister': "/register",
	'/checkLogin': "/login",
	'/validateUserEmailCode': "/confirmUserEmailCode",
	'/checkEmailCode': "/validateEmailCode",
	'/setAuthUsername': "/changeUsername",
	'/setAuthNickname': "/changeNickname",
	'/setAuthEmail': "/changeEmail",
	'/setAuthPassword': "/changeYourPassword",
	'/setUserDescription': "/changeDescription"
};

const filter = new Filter();

// Blacklist to add new bad-words

const list = fs.readFileSync("./config/.blacklist.txt", "utf8")
    .split("\n")
    .map(w => w.trim())
    .filter(Boolean); // check invalid values, ignoring them

filter.addWords(...list);

export async function validatorHook(req, reply) {
	if (!req.body) return ;

	let error = [];
	let success = [];

	const check = [
		{
			condition: req.body.password && !passwordRegex.test(req.body.password),
			message: "Password must have numbers, letters, special characters"
		},
		{
			condition: req.body.password && req.body.password.length < 8,
			message: "Password must contain eight or more characters"
		},
		{
			condition: req.body.password && req.url !== '/checkLogin' && (!req.body.confirmPassword || req.body.confirmPassword !== req.body.password),
			message: "Password Mismatch"
		},
		{
			condition: req.body.captchaInput && req.session.captcha !== req.body.captchaInput,
			message: "Invalid captcha code, try again"
		},
		{
			condition: req.body.email && !emailRegex.test(req.body.email),
			message: "Invalid e-mail"
		},
		{
			condition: req.body.username && (!usernameRegex.test(req.body.username) || req.body.username.length < 3 || req.body.username.length > 20),
			message: "Invalid username"
		},
		{
			condition: req.body.nickname && (!usernameRegex.test(req.body.nickname) || req.body.nickname.length < 3 || req.body.nickname.length > 20),
			message: "Invalid nickname"
		},
	];

	check.forEach((item) => {
		if (item.condition)
			error.push(item.message);
	});

	if (req.body.username) {
		const response = await checkNameSecurity(req.body.username);
		if (response.nsfw || filter.isProfane(req.body.username))
			error.push("Innapropriate username");
	}

	if (req.body.nickname) {
		const response = await checkNameSecurity(req.body.nickname);
		if (response.nsfw || filter.isProfane(req.body.nickname)) {
			error.push("Innapropriate nickname");
		}
	}

	if (!error.length) return ;

	req.session.success = success;
	req.session.error = error;

	if (!(req.url in redirect)) return ;

	return reply.redirect(redirect[req.url]);
}

export async function authHook(req, reply) {
	const token = req.cookies?.jwt;
	// Check if the user has a token
	if (!token) {
		return reply.redirect("/login");
	}

	try {
		const data = jwt.verify(token, process.env.JWT_SECRET);
		req.jwt = token; // original jwt
		req.user = data;  // decoded data
		req.user.isOnline = true;
		if (!req.session.check) {
			console.log("Entrei aqui AUTH");
			req.session.check = true;
			await axios.post("http://users-service:3003/setIsOnline", { user_id: data.user_id, isOnline: true });
		}
	} catch (err) {
		if (err.name === "TokenExpiredError") {

			const token = req.cookies.jwt;
                	const data = jwt.decode(token) || {};

                	await axios.post("http://users-service:3003/setIsOnline", { user_id: data.user_id, isOnline: false });

                	await req.session.destroy();

                	reply.clearCookie("jwt");
                	reply.clearCookie("session");

                	await axios.post("http://auth-service:3001/set2FAValidate", { email: data.email, signal: false });
                	return reply.redirect("/login");

		} else if (err.name === "JsonWebTokenError") {
			return reply.redirect("/login");
		}
		return reply.code(500).send("Authentication internal error");
	}
	return ;
}

export async function require2faHook(req, reply) {
	const token = req.cookies?.jwt;
	let decoded = null;
	try {
		if (req.url === "/check2FAQrCode" || req.url === "/validate2FAQrCode")
			return ;
		if (!token)
			return reply.redirect("/login");
		decoded = jwt.verify(token, process.env.JWT_SECRET) ?? {};
		const twoFactorEnable = await axios.post("http://auth-service:3001/get2FAEnable", { email: req.user.email });
		if (twoFactorEnable?.data.twoFactorEnable) {
			const twoFactorValidate = await axios.post("http://auth-service:3001/get2FAValidate", { email: req.user.email });
			if (!twoFactorValidate?.data.twoFactorValidate) {
				const qrCodeDataURL = await axios.post("http://auth-service:3001/get2FAQrCode", { email: req.user.email });
				req.session.qrCodeDataURL = qrCodeDataURL?.data.qrCodeDataURL;
				return reply.redirect("/check2FAQrCode");
			}
		}
	} catch (err) {
		if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
			decoded = jwt.decode(token);
			req.user.isOnline = false;
			if (err.name === "TokenExpiredError") {
				// The user must do 2FA again
				await axios.post("http://auth-service:3001/set2FAValidate", { email: decoded.email, signal: false });
			}
			return reply.redirect("/login");
		}
		return reply.code(500).send("Internal Server Error Hook");
	}
	return ;
}
