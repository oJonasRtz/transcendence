import axios from 'axios';
import databaseControllers from '../controllers/databaseControllers.js';

// SQLITE-DB ROUTES

export default async function databaseRoutes(fastify, options) {
	// TESTS
	fastify.get("/hello", databaseControllers.hello);

	// SETTERS
	fastify.post("/registerNewUser", async (req, reply) => {
		return databaseControllers.registerNewUser(fastify, req, reply);
	});

	fastify.post("/tryLoginTheUser", async (req, reply) => {
		return databaseControllers.tryLoginTheUser(fastify, req, reply);
	});

	fastify.post("/getUserData", async (req, reply) => {
		return databaseControllers.getUserData(fastify, req, reply);
	});
};
