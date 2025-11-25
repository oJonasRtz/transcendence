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

	fastify.post("/get2FASecret", authControllers.get2FASecret);

	fastify.post("/get2FAValidate", authControllers.get2FAValidate);

	fastify.post("/set2FASecret", authControllers.set2FASecret);

	fastify.post("/set2FAValidate", authControllers.set2FAValidate);

	fastify.post("/createNewToken", authControllers.createNewToken);

	fastify.post("/getAuthData", authControllers.getAuthData);

	fastify.post("/setAuthUsername", authControllers.setAuthUsername);
}
