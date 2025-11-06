import fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const app = fastify();

const PORT = process.env.PORT || 3001;

app.get("/hello", (req, reply) => {
	return reply.send("The auth-service is working perfectly");
})

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`The auth-service is listening on auth-service:${PORT} port`);
});
