import fastify from 'fastify';
import path from 'path';
import ejs from 'ejs';
import fastifyView from '@fastify/view';
import authRoutes from './routes/authRoutes.js';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import fs from 'fs';
import dotenv from 'dotenv';
import { registerFastifyMetrics } from "./metrics/prometheus.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET is required for auth-service");
}

// It is a temporary configuration
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = fastify({
	https: {
		key: fs.readFileSync('./ssl/server.key'),
		cert: fs.readFileSync('./ssl/server.cert')
	}
});

registerFastifyMetrics(app, { serviceName: "auth-service" });

app.register(cookie, {
	secret: process.env.COOKIE_SECRET || "purpleVoid",
	hook: "onRequest"
});

app.register(formbody);

app.register(authRoutes, {});

app.register(fastifyView, {
	engine: { ejs },
	root: path.join(process.cwd(), "views"),
	viewExt: "ejs"
});

export default app;
