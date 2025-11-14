import usersModel from '../models/usersModel.js';
import axios from 'axios';

const usersControllers = {
	createNewUser: async function createNewUser(req, reply) {
		if (!req.body || !req.body.email)
			return reply.code(400).send("You need to inform user id");
		try {
			await usersModel.createNewUser(req.body);

			return reply.code(201).send("New user account created");
		} catch (err) {
			console.error(`users-service USERS: ${err}`);
			return reply.code(500).send("Error creating user account");
		}
	},

	validateUserEmail: async function validateUserEmail(req, reply) {
                try {
                        if (!req.body || !req.body.email) 
                                return reply.code(400).send("You need to inform a valid e-mail");

			console.log("email users:", req.body.email);

                        await axios.post("https://sqlite-db:3002/validateUserEmail", req.body);

                        return reply.code(200).send("Success");
                } catch (err) {
                        console.error("validateUserEmail USERS", err);
                        return reply.code(500).send("Internal Server Error");
                }
        },
}

export default usersControllers;
