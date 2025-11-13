import usersModel from '../models.usersModel.js';

const usersControllers = {
	createUserAccount: async function createNewUser(req, reply) {
		if (!req.body || !req.body.user_id)
			return reply.code(400).send("You need to inform user id");
		try {
			await usersModel.createNewUser(req.body);

			return reply.code(201).send("New user account created");
		} catch (err) {
			return reply.code(500).send("Error creating user account");
		}
	}
}

export default usersControllers;
