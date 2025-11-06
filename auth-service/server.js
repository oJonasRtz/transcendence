import fastify from 'fastify';
import dotenv from 'dotenv';

dotenv.config();

const app = fastify();

const PORT = process.env.PORT || 3001;

app.get("/hello", (request, response) => {
	console.log("The communication was succedd with auth-service!");
})

app.listen(PORT, () => {
	console.log(`The auth-service is listening on auth-service:${PORT} port`);
});
