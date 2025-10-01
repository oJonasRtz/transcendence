async function channelsRoutes(fastify, options) {
	// obter todos os canais (salas)
	fastify.get('/', async (request, reply) => {
		try{
			const response = await fastify.dbQueries.channels.getAllChannels();
			return reply.code(200).send(response);
		} catch (err) {
			switch (err.message)
			{
				case 'NO_CONTENT':
					return reply.code(204).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}
		}
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
		const { name, topic, password, invitationFlag, limitTopic, hasLimit} = request.body;
		try {
			await fastify.dbQueries.channels.createNewChannel(name, topic, password, invitationFlag, limitTopic, hasLimit);
			return reply.code(201).send('New channel created');
		} catch (err) {
			switch (err.message){
				case 'MISSING_INPUT':
					throw reply.code(400).send(err.message);
				case 'ALREADY_EXISTS':
					throw reply.code(409).send(err.message);
				case 'WEAK_PASSWORD':
					throw reply.code(422).send(err.message);
				default:
					throw reply.code(500).send(err.message);
			}
		}
		return reply.code(200).send('novo canal criado =D');
	});

	// Delete a channel
	fastify.delete('/delete', async (request, reply) => {
		const { name } = request.body;
		try {
			await fastify.dbQueries.channels.deleteChannel(name);
			return reply.code(204).send({});
		} catch (err) {
			switch (err.message) {
				case 'MISSING_INPUT':
					throw new Error(err.message);
				case 'NOT_FOUND':
					throw new Error(err.message);
				default:
					throw new Error(err.message);
			}
		}
	});
}

export default channelsRoutes;
