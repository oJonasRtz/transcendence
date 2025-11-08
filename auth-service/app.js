import fastify from 'fastify';
import path from 'path';
import ejs from 'ejs';
import fastifyView from '@fastify/view';
import authRoutes from './routes/authRoutes.js';
import formbody from '@fastify/formbody';

const app = fastify();

app.register(formbody);

app.register(authRoutes, {});

app.register(fastifyView, {
	engine: { ejs },
	root: path.join(process.cwd(), "views"),
	viewExt: "ejs"
});

export default app;
