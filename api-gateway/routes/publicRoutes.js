import axios from 'axios';
import publicControllers from '../controllers/publicControllers.js';

// AUTH-SERVICE

export default async function publicRoutes(fastify, options) {
	
	fastify.get("/login", publicControllers.login);

	fastify.get("/hello", publicControllers.hello);

	// TESTING BAD ROUTES
	fastify.get("/checkDb", publicControllers.checkDb);
};
