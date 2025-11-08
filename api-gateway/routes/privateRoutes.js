import axios from 'axios';

export default async function privateRoutes(fastify, options) {
	// AUTH-SERVICE
	fastify.get("/helloDb", async (req, reply) => {
        	try {
                	const result = await axios.get("http://auth-service:3001/helloDb");
                	return reply.send(`API GATEWAY - auth: ${result.data}`);
        	} catch (err) {
                	return reply.send(`Unfortunately, the auth-service cannot access the database: ${err.message}`);
        	}
	});	
};
