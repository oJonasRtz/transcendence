async function matchesRoutes (fastify, options) {
	// obter todas as matches
	fastify.get('/', async (request, reply) => {
		return reply.code(200).send('Devolvendo todas as matches');
	});

	// criar uma nova match
	fastify.post('/', async (request, reply) => {
		return reply.code(200).send('Criando uma nova match');
	});

	// obter estado e metadados de uma partida
	fastify.get('/:id', async (request, reply) => {
		return reply.code(200).send('Dados da match selecionada');
	});

	// obter o histórico do jogador
	fastify.get('/users/:id', async (request, reply) => {
		return reply.code(200).send('Histórico do jogador informado');
	});

	// encerrar a partida
	fastify.patch('/:id', async (request, reply) => {
		return reply.code(200).send('Encerrar a partida administrativamente');
	});
}

export default matchesRoutes;
