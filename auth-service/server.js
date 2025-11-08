import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

await app.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`The auth-service is listening on auth-service:${PORT} port`);
});
