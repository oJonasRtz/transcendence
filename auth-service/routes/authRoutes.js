import axios from 'axios';
import authControllers from '../controllers/authControllers.js';

// AUTH-SERVICE ROUTES

export default async function authRoutes(fastify, options) {
	fastify.post("/checkLogin", authControllers.tryLoginTheUser);

	fastify.post("/checkRegister", authControllers.checkRegister);

	fastify.get("/hello", authControllers.hello);

	fastify.get("/getCaptcha", authControllers.getCaptcha);

	fastify.post("/checkEmail", authControllers.checkEmail);

	fastify.get("/helloDb", authControllers.helloDb);
}
