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
	}

	if (req.body && req.body.email) {
		if (!emailRegex.test(req.body.email))
			error.push("Invalid e-mail");
	}

	if (req.body && req.body.username) {
		if (!usernameRegex.test(req.body.username))
			error.push("Invalid username");
	}

	if (req.body && req.body.nickname) {
		if (!usernameRegex.test(req.body.nickname))
			error.push("Invalid nickname");
	}

	if (error.length !== 0) {
		if (req.url === '/register')
			return reply.view("register", { error, success });
		else if (req.url === '/login')
			return reply.view("login", { error, success });
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
		//req.user = decoded.user;
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
