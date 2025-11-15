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

	fastify.post("/checkEmail", async (req, reply) => {
		return databaseControllers.checkEmail(fastify, req, reply);
	});

	fastify.post("/newPassword", async (req, reply) => {
		return databaseControllers.newPassword(fastify, req, reply);
	});

	fastify.post("/createNewUser", async (req, reply) => {
		return databaseControllers.createNewUser(fastify, req, reply);
	});

	fastify.post("/validateUserEmail", async (req, reply) => {
		return databaseControllers.validateUserEmail(fastify, req, reply);
	});

	fastify.post("/get2FAEnable", async (req, reply) => {
		return databaseControllers.get2FAEnabel(fastify, req, reply);
	});
};
