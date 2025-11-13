import axios from 'axios';
import publicControllers from '../controllers/publicControllers.js';

// AUTH-SERVICE

export default async function publicRoutes(fastify, options) {

	fastify.get("/", publicControllers.homePage);

	fastify.get("/login", publicControllers.login);

	fastify.get("/register", publicControllers.register);

	fastify.post("/checkRegister", publicControllers.checkRegister);

	fastify.post("/checkLogin", publicControllers.checkLogin);

	fastify.get("/hello", publicControllers.hello);

	fastify.get("/forgotPassword", publicControllers.forgotPasswordPage);

	fastify.post("/checkEmail", publicControllers.checkEmail);

	fastify.get("/validateEmailCode", publicControllers.validateEmailCode);

	fastify.get("/checkEmailCode", publicControllers.checkEmailCode);

	fastify.post("/checkEmailCode", publicControllers.checkEmailCode);

	fastify.get("/changePassword", publicControllers.changePassword);

	fastify.post("/newPassword", publicControllers.newPassword);

	// TESTING BAD ROUTES
	fastify.get("/checkDb", publicControllers.checkDb);
};
