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
};
