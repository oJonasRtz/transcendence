import axios from 'axios';
import authControllers from '../controllers/authControllers.js';

// AUTH-SERVICE ROUTES

export default async function authRoutes(fastify, options) {
	fastify.get("/login", authControllers.login);

	fastify.get("/register", authControllers.register);

	fastify.get("/hello", authControllers.hello);

	fastify.get("/helloDb", authControllers.helloDb);
}
