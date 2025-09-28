import path from 'path';
import AuthUtils from '../src/utils/auth.js';

async function usersRoutes(fastify, options) {

	// Partial update (Nickname, avatar)
	fastify.patch('/update/:id', async (request, reply) => {
		const { id } = request.params;
		const { username, nickname, email, password, gender, avatar, description } = request.body;
		try {
			await fastify.dbQueries.users.updatePatchUser(id, username, nickname, email, password, gender, avatar, description);
			return reply.code(200).send('Succeed update user');
		} catch (err)
		{
			switch (err.message) {
				case 'INVALID_INPUT':
					return reply.code(422).send( { error: err.message } );
				case 'MISSING_INPUT':
					return reply.code(400).send( { error: err.message } );
				case 'ALREADY_EXISTS':
					return reply.code(409).send( { error: err.message } );
				case 'NOT_FOUND':
					return reply.code(404).send( { error: err.message } );
				default:
					return reply.code(500).send( { error: err.message } );
			}
		}
	});

	// Remove a user
	fastify.delete('/remove/:id', async (request, reply) => {
		const { id } = request.params;
		const userId = parseInt(id, 10);
		
		try {
			await fastify.dbQueries.users.removeUser(userId);
			return reply.code(204).send();
		} catch (err)
		{
			return reply.code(404).send();
		}
	});

	// Get list with all users

	fastify.get('/', async (request, reply) => {
		try {
			const users = await fastify.dbQueries.users.getAllUsers();
			return reply.code(200).send(users);
		} catch (err) {
			switch (err.message) {
				case 'NO_CONTENT':
					return reply.code(204).send({message: 'No content'});
				default:
					return reply.code(500).send({message: 'Internal Server Error'});
			}
		}
	});

	// Get a user specified by an ID

	fastify.get('/:id', async (request, reply) => {
		const { id } = request.params;
		const userId = parseInt(id, 10);

		try {
			const user = await fastify.dbQueries.users.getIdUser(userId);
			return reply.code(200).send(user);
		} catch (err) {
			switch (err.message) {
				case 'NO_CONTENT':
					return reply.code(204).send({message: err.message});
				default:
					return reply.code(500).send({message: 'INTERNAL_SERVER_ERROR'});
			};
		}
	});

	// Get a user specified by a query

	fastify.get('/search', async (request, reply) => {
		const { nickStartWith } = request.query;
		if (!nickStartWith)
			return reply.code(400).send({message: 'MISSING_INPUT'});
		try {
			const user = await fastify.dbQueries.users.getQueryUser(nickStartWith);
			return reply.code(200).send(user);
		} catch (err) {
			switch (err.message) {
				case 'NO_CONTENT':
					return reply.code(204).send({message: err.message});
				case 'BAD_REQUEST':
					return reply.code(400).send({message: err.message});
				default:
					return reply.code(500).send({message: 'INTERNAL_SERVER_ERROR'});
			};
		}
	});

	fastify.post('/register', async (request, reply) => {
		const { username, nickname, email } = request.body;
		if (!username || !nickname || !email)
			return reply.code(400).send('MISSING_INPUT');
		try {
			await fastify.dbQueries.users.newUser(username, nickname, email);
			return reply.code(201).send('DONE');
		} catch (err) {
			switch (err.message) {

			case "MISSING_INPUT":
				return reply.code(400).send(err.message);
			case "INTERNAL_SERVER_ERROR":
				return reply.code(500).send(err.message);
			case "USER_EXISTS":
				return reply.code(409).send(err.message)
			default:
				return reply.code(401).send('UNAUTHORIZED');
			}
		}
	});

	// Substitute an entire user, full update
	fastify.put('/update/:id', async (request, reply) => {
		const { id } = request.params;
		const { username, nickname, email, password, gender, avatar, description } = request.body;
		try {
			await fastify.dbQueries.users.updatePutUser(id, username, nickname, email, password, gender, avatar, description);
			return reply.code(200).send('Succeed update user');
		} catch (err)
                {
                        switch (err.message) {
                                case 'INVALID_INPUT':
                                        return reply.code(422).send( { error: err.message } );
                                case 'MISSING_INPUT':
                                        return reply.code(400).send( { error: err.message } );
                                case 'ALREADY_EXISTS':
                                        return reply.code(409).send( { error: err.message } );
                                case 'NOT_FOUND':
                                        return reply.code(404).send( { error: err.message } );
                                default:
                                        return reply.code(500).send( { error: err.message } );
                        }
                }
	});

	// Obtain status of user
	fastify.get('/:id/stats', async (request, reply) => {
		const { id } = request.params;
		try {
			const response = await fastify.dbQueries.users.getUserStatus(id);
			return reply.code(200).send(response);
		} catch (err) {
			switch (err.message) {
				case 'MISSING_INPUT':
					return reply.code(400).send({ error: err.message });
				case 'NOT_FOUND':
					return reply.code(404).send({ error: err.message });
				case 'NO_CONTENT':
					return reply.code(204).send({ error: err.message });
				default:
					return reply.code(500).send({ error: err.message });
			}	
		}
	});

	/* Upload an avatar
	fastify.post('/:id/avatar', async (request, reply) => {
		const { id } = request.params;
		return reply.code(200).send('O avatar foi enviado camarada');
	});*/
}

export default usersRoutes; 
