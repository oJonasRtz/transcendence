import fastify from 'fastify';
import path from 'path';
import ejs from 'ejs';
import fastifyView from '@fastify/view';

const app = fastify();

app.register(fastifyView, {
	engine: { ejs },
	root: path.join(process.cwd(), "views"),
	viewExt: "ejs"
});

export default app;
