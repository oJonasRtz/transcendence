async function lobbiesRoutes(fastify, options) {
	// Retorna todas as salas de espera disponíveis
	fastify.get('/', async (request, reply) => {
		return reply.code(200).send('Toma todos os lobbies');
	});

	// Cria uma sala de espera
	fastify.post('/', async (request, reply) => {
		return reply.code(200).send('Criando sua sala de espera...');
	});

	// Retorna uma sala de espera específica
	fastify.get('/:id', async (request, reply) => {
		return reply.code(200).send('Retornando sala de espera especificada');
	});

	// Fazer usuário entrar na sala de espera
	fastify.post('/:id/join', async (request, reply) => {
		return reply.code(200).send('Usuário adicionado na lista de espera');
	});

	// Fazer o usuário sair da sala de espera, mas o jogo não começou
	fastify.post('/:id/leave', async (request, reply) => {
		const { id } = request.params;
		return reply.code(200).send('Usuário pediu para sair da sala');
	});

	// O host aceitou o jogo começar
	fastify.post('/:id/start', async (request, reply) => {
		return reply.code(200).send('O jogo vai começar');
	});
}

export default lobbiesRoutes;
