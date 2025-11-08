import axios from 'axios';
import jwt from 'jsonwebtoken';

export async function authHook(req, reply) {
	const token = req.cookies?.jwt;

	// Check if the user has a token
	if (!token) {
		const { data: html } = await axios.get("http://auth-service:3001/login");
		return reply.type('text/html').send(html);
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
			const { data: html } = await axios.get("http://auth-service:3001/login");
			return reply.type('text/html').send(html);
		}
		console.error("JWT ERROR:", err);
		return reply.code(500).send("Authentication internal error");
	}
}
