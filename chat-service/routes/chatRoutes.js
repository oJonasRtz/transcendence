import chatControllers from '../controllers/chatControllers.js';

export default async function chatRoutes(fastify, options) {

	fastify.post("/storeMessage", chatControllers.storeMessage);

	fastify.post("/getAllMessages", chatControllers.getAllMessages);

	fastify.post("/getAllPrivateMessages", chatControllers.getAllPrivateMessages);

	fastify.post("/storePrivateMessage", chatControllers.storePrivateMessage);
};
