const Fastify = require('fastify');

const app = Fastify({logger: true});

app.get('/', async () => ({hello: 'world'}));

app.get('/health', async () => {
	return {status: 'ok', runtime: 'node', version: process.version}
});

/* Only for test */
app.get('/fail', async () => {
	throw new Error('Explodiu mano');
});

app.setNotFoundHandler((req, reply) => {
	reply.code(404).send({
		error: 'Not found',
		method: 'req.method',
		path: req.url,
	});
});

app.setErrorHandler((err, req, reply) => {
	req.log.error({err}, 'unhandled error');

	const isDev = process.env.NODE_ENV !== 'production';

	reply.code(err.statusCode ?? 500).send({
		error: 'Internal Server error',
		message: isDev ? err.message : 'Something went wrong',
		...(isDev ? {stack: err.stack}: {})
	});
});

app.listen({host: '127.0.0.1', port: 3000});
