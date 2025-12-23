async function matchmakingRoutes(fastify, options) {
	// entra na fila
	fastify.post('/enqueue', async (request, reply) => {
		reply.code(200).send('Entrou na fila');
	});

	// sair da fila
	fastify.post('/dequeue', async (request, reply) => {
		reply.code(200).send('Saiu da fila');
	});

	// status da fila
	fastify.get('/status', async (request, reply) => {
		reply.code(200).send('status da montagem de partidas, finalizado ou não');
	});
}

export default matchmakingRoutes;
