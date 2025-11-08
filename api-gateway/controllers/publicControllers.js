import axios from 'axios';

const publicControllers = {
	//GETTERS
	login: async function getLoginPage (req, reply) {
		try {
                        const { data: html } = await axios.get("http://auth-service:3001/login");
                        return reply.type('text/html').send(html);
                } catch (err) {
                        return reply.code(500).send("Internal Server Error:", err);
                }
	},

	register: async function getRegisterPage(req, reply) {
		try {
			const { data: html } = await axios.get("http://auth-service:3001/register");
			return reply.type('text/html').send(html);
		} catch (err) {
			return reply.code(500).send("Internal Server Error");
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
