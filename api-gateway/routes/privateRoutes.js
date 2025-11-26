import axios from 'axios';
import privateControllers from '../controllers/privateControllers.js';

// AUTH-SERVICE

export default async function privateRoutes(fastify, options) {
	fastify.get("/helloDb", privateControllers.helloDb);

	fastify.get("/home", privateControllers.getHomePage);

	fastify.get("/logout", privateControllers.logout);

	fastify.get("/confirmUserEmail", privateControllers.confirmUserEmail);

	fastify.get("/confirmUserEmailCode", privateControllers.confirmUserEmailCode);

	fastify.post("/validateUserEmailCode", privateControllers.validateUserEmailCode);

	fastify.get("/get2FAQrCode", privateControllers.get2FAQrCode);

	fastify.get("/check2FAQrCode", privateControllers.check2FAQrCode);

	fastify.post("/validate2FAQrCode", privateControllers.validate2FAQrCode);
	fastify.post("/upload", privateControllers.upload);

	fastify.get("/changeUsername", privateControllers.changeUsername);

	fastify.post("/setAuthUsername", privateControllers.setAuthUsername);

	fastify.get("/changeNickname", privateControllers.changeNickname);

	fastify.post("/setAuthNickname", privateControllers.setAuthNickname);

	fastify.get("/changeEmail", privateControllers.changeEmail);

	fastify.post("/setAuthEmail", privateControllers.setAuthEmail);

	fastify.get("/changeYourPassword", privateControllers.changePassword);

	fastify.post("/setAuthPassword", privateControllers.setAuthPassword);
}
