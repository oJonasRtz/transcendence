import app from './app.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
	console.log(`Api-gateway is running on api-gateway:${PORT} port`);
});
