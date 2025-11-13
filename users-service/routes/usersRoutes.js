import axios from 'axios';

export default async function usersRoutes(fastify, options) {
	fastify.post("/createUserAccount", usersControllers.createUserAccount);
};
