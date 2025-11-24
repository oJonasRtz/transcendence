import axios from 'axios';
import usersControllers from '../controllers/usersControllers.js';

export default async function usersRoutes(fastify, options) {
	fastify.post("/createNewUser", usersControllers.createNewUser);

	fastify.post("/validateUserEmail", usersControllers.validateUserEmail);

	fastify.post("/getIsOnline", usersControllers.getIsOnline);

	fastify.post("/getQueue", usersControllers.getQueue);

	fastify.post("/setIsOnline", usersControllers.setIsOnline);

	fastify.post("/getUserAvatar", usersControllers.getUserAvatar);

	fastify.post("/setUserAvatar", usersControllers.setUserAvatar);

	fastify.post("/setInGame", usersControllers.setInGame);

	fastify.post("/getInGame", usersControllers.getInGame);

	fastify.post("/getUserInformation", usersControllers.getUserInformation);
};
