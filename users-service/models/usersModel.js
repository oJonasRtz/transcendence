import axios from 'axios';

const usersModel = {
	createNewUser: async function createNewUser(req, reply) {
		if (!req.body || !req.body.user_id)
			return reply.code(400).send("You need to inform the user_id");

		await axios.post("https://sqlite-db:3002/createNewUser");

		return reply.code(201).send("Success");
	}
}

export default usersModel;
