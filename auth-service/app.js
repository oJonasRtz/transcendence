import fastify from 'fastify';
import path from 'path';
import ejs from 'ejs';
import fastifyView from '@fastify/view';
import authRoutes from './routes/authRoutes.js';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// It is a temporary configuration
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = fastify();

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
