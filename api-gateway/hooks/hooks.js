import axios from 'axios';
import jwt from 'jsonwebtoken';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;

export async function validatorHook(req, reply) {
	let error = [];
	let success = [];

	if (req.body && req.body.password) {
		if (!passwordRegex.test(req.body.password))
			error.push("Password must have numbers, letters, special characters");
	
		if (req.body.password.length < 8)
			error.push("Password must contain eight or more characters");

		if (req.url !== '/checkLogin') {
			if (!req.body.confirmPassword || req.body.confirmPassword !== req.body.password)
				error.push("Password Mismatch");
		}
	}

	if (req.body && req.body.captchaInput) {
		if (req.session.captcha !== req.body.captchaInput)
			error.push("Invalid captcha code, try again");
		if (req.url === '/checkEmailCode') {
			if (req.session.captcha !== req.body.captchaInput) {
				req.session.error = ["Invalid Validation Code"];
				return reply.redirect('/validateEmailCode');
			}
		}
	}

	if (req.body && req.body.email) {
		if (!emailRegex.test(req.body.email))
			error.push("Invalid e-mail");
	}

	if (req.body && req.body.username) {
		if (!usernameRegex.test(req.body.username) || req.body.username.length < 3)
			error.push("Invalid username");
	}

	if (req.body && req.body.nickname) {
		if (!usernameRegex.test(req.body.nickname) || req.body.nickname.length < 3)
			error.push("Invalid nickname");
	}

	if (error.length !== 0) {
		req.session.success = success;
		req.session.error = error;
		if (req.url === '/checkRegister') {
			return reply.redirect("/register");
		}
		else if (req.url === '/checkLogin')
			return reply.redirect("/login");
	}

	return ;
};

export async function authHook(req, reply) {
	const token = req.cookies?.jwt;

	// Check if the user has a token
	if (!token) {
		reply.redirect("/login");
		return ;
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.jwt = token; // original jwt
		req.user = decoded;  // decoded data
	} catch (err) {
		if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
			reply.redirect("/login");
			return ;
		}
		console.error("JWT ERROR:", err);
		return reply.code(500).send("Authentication internal error");
	}
	return ;
}
