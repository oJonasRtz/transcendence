import app from './app.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.get("/login", (req, reply) => {
	return reply.view("login");
});

app.get("/hello", (req, reply) => {
	return reply.send("The auth-service is working perfectly");
})

app.get("/helloDb", async (req, reply) => {
	try {
		const response = await axios.get("http://sqlite-db:3002/hello");
		return reply.send(`Auth-service confirms communication with sqlite-db ${response.data}`);
		console.log("Success communicating with database");
	} catch(err) {
		console.error("The auth-service cannot communicate correctly with sqlite-db");
		return reply.code(500).json({ error: "INTERNAL_SERVER_ERROR" });
	}
});

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`The auth-service is listening on auth-service:${PORT} port`);
});
