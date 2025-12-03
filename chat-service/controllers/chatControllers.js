import axios from 'axios';

const chatControllers = {
	storeMessage: async function storeMessage(req, reply) {
		try {
			if (!req.body || !req.body.name ||!req.body.msg)
				return reply.code(400).send("You need to inform the msg and name here");
			await axios.post("http://sqlite-db:3002/storeMessage", req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("CHAT-SERVICE storeMessage ERROR:", err);
			return reply.code(500).send("An error happened");
		}
	},

	getAllMessages: async function getAllMessages(req, reply) {
		try {
			const response = await axios.get("http://sqlite-db:3002/getAllMessages");
			return reply.code(200).send(response?.data ?? null);
		} catch (err) {
			console.error("CHAT-SERVICE getAllMessages ERROR:", err);
			return reply.code(500).send("An error happened");
		}
	}
}

export default chatControllers;
