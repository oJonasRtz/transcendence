import axios from 'axios';

const publicControllers = {
	
	//GETTERS
	
	homePage: function getHomePage(req, reply) {
		return reply.view("homePage");
	},

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

	//SETTERS

	checkRegister: async function tryRegisterNewUser(req, reply) {
		let success = [];
		let error = [];
		try {
			const response = await axios.post("http://auth-service:3001/checkRegister", req.body);

			success = response.data.success || [];
			error = response.data.error || [];

			return reply.view("register", { success, error });
		} catch (err) {
			success = err.response.data.success || [];
			error = err.response.data.error || [];
			return reply.view("register", { success, error });
		}
	},

	// Authentication
	
	checkLogin: async function tryLoginTheUser(req, reply) {
		let success = [];
		let error = [];
		try {
			await axios.post("http://auth-service:3001/checkLogin", req.body);

			return reply.redirect("/homePage");
		} catch (err) {
			success = err?.response?.data?.success || []; // optional, we are thinking about it
			error = err?.response?.data?.error || [];
			console.error("Error trying login");
			return reply.view("login", { success, error });
		}
	},

	//TESTS
	hello: async function testAuthServiceConnection (req, reply) {
		try {
                        const result = await axios.get("http://auth-service:3001/hello");
                        return reply.send(`API GATEWAY - auth: ${result.data}`);
                } catch (err) {
                        console.error("Unfortunately, the api-gateway failed to communicate with auth-service by:", err.message);
                        return reply.code(500).send("Error:", err.message);
                }
	},

	checkDb: async function testGatewayConnectionWithSqlite (req, reply) {
                try {
                        const result = await axios.get("http://sqlite-db:3002/hello");
                        return reply.send(`API GATEWAY - sqlite: ${result.data}`);
                } catch (err) {
                        console.error("Unfortunately, the api-gateway failed to communicate with sqlite-db by:", err.message);
                        return reply.send("The API-GATEWAY cannot access database anymore");
                }
	}
};

export default publicControllers;
