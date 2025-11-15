import axios from 'axios';
import authControllers from '../controllers/authControllers.js';

// AUTH-SERVICE ROUTES

export default async function authRoutes(fastify, options) {
	fastify.post("/checkLogin", authControllers.tryLoginTheUser);

	fastify.post("/checkRegister", authControllers.checkRegister);

	fastify.get("/hello", authControllers.hello);

	fastify.get("/getCaptcha", authControllers.getCaptcha);

	fastify.post("/checkEmail", authControllers.checkEmail);

	fastify.post("/newPassword", authControllers.newPassword);

	fastify.get("/helloDb", authControllers.helloDb);

	fastify.post("/get2FAQrCode", authControllers.get2FAQrCode);

	fastify.post("/get2FAEnable", authControllers.get2FAEnable);
}
