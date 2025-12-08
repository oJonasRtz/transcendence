import axios from 'axios';

const chatControllers = {
	storeMessage: async function storeMessage(req, reply) {
		try {
			if (!req.body || !req.body.name ||!req.body.msg)
				return reply.code(400).send("You need to inform the msg and name here");
			if (req.body.isSystem === undefined)
				req.body.isSystem = false;
			await axios.post("http://sqlite-db:3002/storeMessage", req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("CHAT-SERVICE storeMessage ERROR:", err);
			return reply.code(500).send("An error happened");
		}
	},

	getAllMessages: async function getAllMessages(req, reply) {
		try {
			console.log ("username chat-service:", req.body.username);
			if (!req.body || !req.body.username)
				return reply.code(400).send("You need to inform the username here");
			const response = await axios.post("http://sqlite-db:3002/getAllMessages", { username: req.body.username });
			return reply.code(200).send(response?.data ?? null);
		} catch (err) {
			console.error("CHAT-SERVICE getAllMessages ERROR:", err);
			return reply.code(500).send("An error happened");
		}
	}
}

export default chatControllers;
