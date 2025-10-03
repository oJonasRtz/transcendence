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
		const { name, topic, password, invitationFlag, limitTopic, hasLimit, isPrivate} = request.body;
		try {
			await fastify.dbQueries.channels.createNewChannel(name, topic, password, invitationFlag, limitTopic, hasLimit, isPrivate);
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

	//add a new user into a channel
	fastify.post('/addUser', async (request, reply) => {
		const { channel_id, channel_name, password, username, nickname, email} = request.body;
		try {
			await fastify.dbQueries.channels.addUserToChannel(channel_id, channel_name, password, username, nickname, email);
			return reply.code(201).send('USER_ADDED_TO_CHANNEL');
		} catch (err) {
			switch (err.message) {
				case 'MISSING_INPUT':
					return reply.code(400).send(err.message);
				case 'NOT_FOUND_USER':
					return reply.code(404).send(err.message);
				case 'NOT_FOUND_CHANNEL':
					return reply.code(404).send(err.message);
				case 'FORGOT_PASSWORD':
					return reply.code(400).send(err.message);
				case 'WITHOUT_INVITATION':
					return reply.code(401).send(err.message);
				case 'INVALID_PASSWORD':
					return reply.code(401).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}
		}
	});

	// get all users of specif channel
	fastify.get('/getChannelUsers', async (request, reply) => {
		const { channelName } = request.query;
		try {
			const response = await fastify.dbQueries.channels.getChannelUsers(channelName);
			return reply.code(200).send(response);
		} catch (err) {
			switch (err.message) {
				case 'NO_CONTENT':
					return reply.code(204).send(err.message);
				case 'MISSING_INPUT':
					return reply.code(400).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}	
		}
	});

	// delete all users of specif channel
	fastify.delete('/deleteChannelUser', async (request, reply) => {
		const { channel_name, username, nickname, email } = request.body;
		try {
			await fastify.dbQueries.channels.deleteChannelUser(channel_name, username, nickname, email);
			return reply.code(204).send({});
		} catch (err) {
			switch (err.message) {
				case 'MISSING_INPUT':
					return reply.code(200).send(err.message);
				case 'NOT_FOUND_USER':
					return reply.code(404).send(err.message);
				case 'NOT_FOUND_CHANNEL':
					return reply.code(404).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}
		}
	});

	// Get visible channels
	fastify.get('/getChannels', async (request, reply) => {
		try{
			const response = await fastify.dbQueries.channels.getVisibleChannels();
			return reply.code(200).send(response);
		} catch (err) {
			switch (err.message) {
				case 'NO_CONTENT':
					return reply.code(204).send(err.message);
				default:
					return reply.code(500).send(err.message);
			}
		}
	});

	// Invite a user to a channel
	fastify.post('/inviteUser', async (request, reply) => {
		const { channel_name, channel_id, ownerEmail, targetUsername, targetNickname, targetEmail } = request.body;
		try {
			await fastify.dbQueries.channels.inviteNewUser(channel_name, channel_id, ownerEmail, targetUsername, targetNickname, targetEmail);
			return reply.code(201).send('INVITED');
		} catch (err) {
			switch (err.message) {
				case 'MISSING_INPUT':
					return reply.code(400).send(err.message);
				case 'NOT_FOUND_TARGET':
					return reply.code(404).send(err.message);
				case 'NOT_FOUND_OWNER':
					return reply.code(404).send(err.message);
				case 'NOT_OPERATOR':
					return reply.code(401).send(err.message);
				case 'ALREADY_EXISTS':
					return reply.code(409).send(err.message);
				case 'NOT_FOUND_CHANNEL':
					return reply.code(404).send(err.message);
				default:
					return reply.code(500).send(err.message);
		}
	}
	});
}
export default channelsRoutes;
