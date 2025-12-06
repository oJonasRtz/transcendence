export default function (fastify) {
	fastify.setErrorHandler((request, reply) =>
{
        reply
                .code(500)
                .type('application/json')
                .send({
                        error: 'Internal Server Error',
                        message: `Route ${request.method} ${request.url} error`,
                        statusCode: 500
                });
	});
}
