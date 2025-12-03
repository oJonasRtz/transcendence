import chatControllers from '../controllers/chatControllers.js';

export default async function chatRoutes(fastify, options) {

	fastify.post("/storeMessage", chatControllers.storeMessage);

	fastify.get("/getAllMessages", chatControllers.getAllMessages);
};
