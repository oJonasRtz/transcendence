async function lobbiesRoutes(fastify, options) {
	// Retorna todas as salas de espera disponíveis
	fastify.get('/', async (request, reply) => {
		return reply.code(200).send('Toma todos os lobbies');
	});

	// Cria uma sala de espera
	fastify.post('/', async (request, reply) => {
		const { lobby_name, game_mode } = request.body;
		try {
			await fastify.dbQueries.lobbies.createNewLobby(lobby_name, game_mode);
			return reply.code(200).send('New lobby done');
		} catch (err){
			switch (err.message) {
				case 'MISSING_INPUT':
					return reply.code(400).send(err.message);
				case 'ALREADY_EXISTS':
					return reply.code(409).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}
		}
	});

	// Retorna uma sala de espera específica
	fastify.get('/:id', async (request, reply) => {
		const { id } = request.params;
		try {
			const lobby = await fastify.dbQueries.lobbies.getLobbyById(id);
			return reply.code(200).send(lobby);
		} catch (err){
			switch (err.message) {
				case 'MISSING_INPUT':
					return reply.code(400).send(err.message);
				case 'NOT_FOUND':
					return reply.code(404).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}
		}
	});

	// Fazer usuário entrar na sala de espera
	fastify.post('/:id/join', async (request, reply) => {
		const { id } = request.params;
		const { username, nickname, email, lobby_name } = request.body;

		try {
			await fastify.dbQueries.lobbies.addNewUserToLobby(username, nickname, email, lobby_name, id);
			return reply.code(200).send('New user added to wait list');
		} catch (err) {
			switch (err.message){
				case 'MISSING_INPUT':
					return reply.code(400).send(err.message);
				case 'USER_DOES_NOT_EXIST':
					return reply.code(404).send(err.message);
				case 'LOBBY_DOES_NOT_EXIST':
					return reply.code(404).send(err.message);
				case 'MAXIMUM_CAPACITY':
					return reply.code(409).send(err.message);
				case 'ALREADY_EXISTS':
					return reply.code(409).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}
		}
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
