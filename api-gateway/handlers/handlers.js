export function errorHandler(fastify) {
	fastify.setErrorHandler((error, req, reply) => {
        	return (reply.code(500).view("error", {}));
	});
}

export function notFoundHandler(fastify) {
	fastify.setNotFoundHandler((req, reply) => {
       		return reply.code(404).view("notFound", {});
	});
}
