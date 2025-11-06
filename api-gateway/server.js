import fastify from 'fastify';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = fastify();

const PORT = process.env.PORT || 3000;

app.get("/api/auth/hello", async (req, reply) => {
	try {
		const result = await axios.get("http://auth-service:3001/hello");
		reply.send(`API GATEWAY - auth: ${result.data}`);
	} catch (err) {
		console.error("Unfortunately, the api-gateway failed to communicate with auth-service by:", err.message);
		reply.code(500).send("Error:", err.message);
	}
});

app.get("/api/db/hello", async (req, reply) => {
	try {
		const result = await.axios.get("http://sqlite-db:3002/hello");
		reply.send(`API GATEWAY - sqlite: ${result.data}`);
	} catch (err) {
		console.error("Unfortunately, the api-gateway failed to communicate with sqlite-db by:", err.message);
		reply.code(500).send("Error:", err.message);
	}
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Api-gateway is running on api-gateway:${PORT} port`);
});
