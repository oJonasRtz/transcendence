export default function (fastify) {
	fastify.setNotFoundHandler((request, reply) => {
        reply
                .code(404)
                .type(('application/json'))
                .send({
                        error: 'Not found',
                        message: `Route ${request.method} ${request.url} doesn't exist`,
                        statusCode: 404
                });
	});
}
