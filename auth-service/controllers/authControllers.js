import axios from 'axios';

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
