import axios from 'axios';

export default async function publicRoutes(fastify, options) {
	// AUTH-SERVICE
	fastify.get("/auth/hello", async (req, reply) => {
        	try {
                	const result = await axios.get("http://auth-service:3001/hello");
                	return reply.send(`API GATEWAY - auth: ${result.data}`);
        	} catch (err) {
                	console.error("Unfortunately, the api-gateway failed to communicate with auth-service by:", err.message);
                	return reply.code(500).send("Error:", err.message);
        	}
	});

	// TESTING BAD ROUTES
	fastify.get("/db/hello", async (req, reply) => {
        	try {
                	const result = await axios.get("http://sqlite-db:3002/hello");
                	return reply.send(`API GATEWAY - sqlite: ${result.data}`);
        	} catch (err) {
                	console.error("Unfortunately, the api-gateway failed to communicate with sqlite-db by:", err.message);
                	return reply.send("The API-GATEWAY cannot access database anymore");
        	}
	});
};
