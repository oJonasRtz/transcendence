import axios from 'axios';
import authModels from '../models/authModels.js';

// AUTH-SERVICE CONTROLLERS

const authControllers = {

	// GETTERS 
	login: function getLoginPage(req, reply) {
		const success = [];
		const error = [];
		return reply.view("login", { success, error });
	},

	register: function getRegisterPage(req, reply) {
		const success = [];
		const error = [];
		return reply.view("register", { success, error });
	},

	// SETTERS
	
	checkRegister: async function tryRegisterTheUser(req, reply) {
		const success = [];
		const error = [];
		try {
			const { username, nickname, email, password, confirmPassword } = req.body;

			if (!username || !nickname || !email || !password || !confirmPassword) {
				error.push("You forgot to complete all fields");
				return reply.view("register", { success, error });
			}

			if (password !== confirmPassword) {
				error.push("Password Mismatch");
				return reply.view("register", { success, error });
			}

			await authModels.registerNewUser(req.body);

			success.push(`User ${username} registered successfully`);
			return reply.view("register", { success, error });
		} catch (err) {
			console.error("An error happened during registration process:", err);
			error.push("An error happened, please try again.");
			return reply.view("register", { success, error });
		}
	},

	// TESTS
	hello: function testAuthServiceConnection(req, reply) {
		return reply.send("The auth-service is working perfectly");
	},

	helloDb: async function testCommunicationAuthWithDatabase(req, reply) {
		try {
                        const response = await axios.get("http://sqlite-db:3002/hello");
                        return reply.send(`Auth-service confirms communication with sqlite-db ${response.data}`);
                        console.log("Success communicating with database");
                } catch(err) {
                        console.error("The auth-service cannot communicate correctly with sqlite-db");
                        return reply.code(500).json({ error: "INTERNAL_SERVER_ERROR" });
                }
	}
}

export default authControllers;
