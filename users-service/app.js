import fastify from 'fastify';
import path from 'path';
import ejs from 'ejs';
import fastifyView from '@fastify/view';
import usersRoutes from './routes/usersRoutes.js';
import formbody from '@fastify/formbody';

const app = fastify();

app.register(formbody);

app.register(usersRoutes, {});

app.register(fastifyView, {
	engine: { ejs },
	root: path.join(process.cwd(), "views"),
	viewExt: "ejs"
});

export default app;
