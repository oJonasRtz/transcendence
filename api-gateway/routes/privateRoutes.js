import axios from 'axios';
import privateControllers from '../controllers/privateControllers.js';

// AUTH-SERVICE

export default async function privateRoutes(fastify, options) {
	fastify.get("/helloDb", privateControllers.helloDb);

	fastify.get("/home", privateControllers.getHomePage);
};
