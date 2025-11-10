import axios from 'axios';
import jwt from 'jsonwebtoken';

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
// 		if (req.url === '/checkRegister')
// 			return reply.view("register", { error, success });
// 		else if (req.url === '/checkLogin')
// 			return reply.view("login", { error, success });
// 	}

// 	return ;
// };

const view = {
	1: "register",
	"-1": "login"
};
const check = [
	{
		cond: (req.body && req.body.password) && !passwordRegex.test(req.body.password),
		msg: "Password must have numbers, letters, special characters"
	},
	{
		cond: (req.body && req.body.password) && req.body.password.length < 8,
		msg: "Password must contain eight or more characters"
	},
	{
		cond: (req.body && req.body.password && req.url !== '/checkLogin') && (!req.body.confirmPassword || req.body.confirmPassword !== req.body.password),
		msg: "Password Mismatch"
	},
	{
		cond: (req.body && req.body.email) && !emailRegex.test(req.body.email),
		msg: "Invalid e-mail"
	},
	{
		cond: (req.body && req.body.username) && (!usernameRegex.test(req.body.username) || req.body.username.length < 3),
		msg: "Invalid username"
	},
	{
		cond: (req.body && req.body.nickname) && (!usernameRegex.test(req.body.nickname) || req.body.nickname.length < 3),
		msg: "Invalid nickname"
	}
];

export async function validatorHook(req, reply) {
	let error = [];
	let success = [];

	check.forEach(item => {
		if (item.cond)
			error.push(item.msg);
	});

	if (!error.length) return;

	const cond = (req.url === '/checkRegister') - (req.url === '/checkLogin');
	
	return reply.view(view[cond], { error, success });
}

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
