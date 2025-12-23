async function tournamentRoutes(fastify, options) {
	// Cria um torneio
	fastify.post('/', async (request, reply) => {
	try {
		const { name, maxParticipants } = request.body;
    		if (!name || name.trim().length === 0) {
			return reply.code(400).send({ error: 'Tournament name is required' });
		}
    		const tournament = await fastify.dbQueries.createTournament(name.trim(), maxParticipants);
		return reply.code(201).send({ tournament });
    } catch (error) {
    	fastify.log.error(error);
    	return reply.code(500).send({ error: 'Internal server error' });
  }
});
	// Lista os torneios
	fastify.get('/', async (request, reply) => {
		return reply.code(200).send({ message: 'Success!'});
	});

	// Obter um torneio específico
	fastify.get('/:id', async (request, reply) => {
		return reply.code(200).send('Seu torneio específico');
	});

	// editar detalhes de um torneio
	fastify.patch('/:id', async (request, reply) => {
		return reply.code(200).send('Editando o torneio de id especificado');
	});

	// inscrever time/jogador
	fastify.post('/:id/register', async (request, reply) => {
		return reply.code(200).send('Time/Jogador registrado no torneio');
	});

	// ranking to torneio
	fastify.get('/:id/leaderboard', async (request, reply) => {
		return reply.code(200).send('O ranking do torneio');
	});

	// semente da partida, o identificador chave único
	fastify.post('/:id/seed', async (request, reply) => {
		return reply.code(200).send('enviada a chave única do torneio');
	});
}

export default tournamentRoutes;
