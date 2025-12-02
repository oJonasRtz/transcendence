import axios from 'axios';

const chatControllers = {
	storeMessage: async function storeMessage(req, reply) {
		try {
			if (!req.body || !req.body.user_id ||!req.body.msg)
				return reply.code(400).send("You need to inform the msg and user_id here");
			await axios.post("http://sqlite-db:3002/storeMessage", req.body);
			return reply.code(204).send();
		} catch (err) {
			console.error("CHAT-SERVICE storeMessage ERROR:", err);
			return reply.code(500).send();
		}
	}
}

export default chatControllers;
