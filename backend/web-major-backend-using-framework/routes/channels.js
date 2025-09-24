async function channelsRoutes(fastify, options) {
	// obter todos os canais (salas)
	fastify.get('/', async (request, reply) => {
		return reply.code(200).send('Tome todos os canais disponíveis');
	});

	// obter o histórico de mensagens de um canal
	fastify.get('/:id/messages', async (request, reply) => {
		return reply.code(200).send('Histórico paginado do chat');
	});

	// enviar uma mensagem no chat
	fastify.post('/:id/messages', async (request, reply) => {
		return reply.code(200).send('Enviada nova mensagem ao canal');
	});

	// Saber o status de todos no canal
	fastify.get('/:id/presence', async (request, reply) => {
		return reply.code(200).send('status de todos, online/playing/lobby');
	});

	// Criar um novo canal
	fastify.post('/create', async (request, reply) => {
		return reply.code(200).send('novo canal criado =D');
	});
}

export default channelsRoutes;
