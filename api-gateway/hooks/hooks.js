import axios from 'axios';
import jwt from 'jsonwebtoken';

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
}
