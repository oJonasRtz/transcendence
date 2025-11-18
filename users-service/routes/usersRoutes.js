import axios from 'axios';
import usersControllers from '../controllers/usersControllers.js';

export default async function usersRoutes(fastify, options) {
	fastify.post("/createNewUser", usersControllers.createNewUser);

	fastify.post("/validateUserEmail", usersControllers.validateUserEmail);

	fastify.post("/getIsOnline", usersControllers.getIsOnline);

	fastify.post("/setIsOnline", usersControllers.setIsOnline);
};
