import path from 'path';
import AuthUtils from '../src/utils/auth.js';

async function usersRoutes(fastify, options) {

	// Partial update (Nickname, avatar)
	fastify.patch('/update/:id', async (request, reply) => {
		return reply.code(200).send('Success update user');
	});

	// Remove a user
	fastify.delete('/remove/:id', async (request, reply) => {
		const { id } = request.params;
		return reply.code(204).send();
	});

	// Get list with all users

	fastify.get('/', async (request, reply) => {
		return reply.code(200).send('Toma todo os usuários');
	});

	// Get a user specified by an ID

	fastify.get('/:id', async (request, reply) => {
		const { id } = request.params;
		return reply.code(200).send('Toma o usuário de id especificado');
	});

	// Get a user specified by a query

	fastify.get('/search', async (request, reply) => {
		const { nickStartWith } = request.query;
		return reply.code(200).send('Toma a pesquisa aproximada pelo nick do usuário');
	});

	fastify.post('/register', async (request, reply) => {
		try {
			const { username, email, password } = request.body;
		if (!AuthUtils.validateUsername(username)) {
			return reply.code(400).send({ error: 'Invalid username' });
		}
		if (!AuthUtils.validateEmail(email)) {
			return reply.code(400).send({ error: 'Invalid email' });
		}
		if (!AuthUtils.validatePassword(password)) {
			return reply.code(400).send({ error: 'Password must be at least 8 characters' });
		}
    		const existingUser = await fastify.dbQueries.getUserByUsername(username);
		if (existingUser) {
 			return reply.code(409).send({ error: 'Username already exists' });
 		}
    		const existingEmail = await fastify.dbQueries.getUserByEmail(email);
		if (existingEmail) {
			return reply.code(409).send({ error: 'Email already exists' });
		}
    		const user = await fastify.dbQueries.createUser(username, email, password);
		return reply.code(201).send({ user: { id: user.id, username: user.username, email: user.email } });
    
		} catch (error) {
			fastify.log.error(error);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

	// Substitute an entire user, full update
	fastify.put('/update/:id', async (request, reply) => {
		const { id } = request.params;
		const { username, email, password } = request.body;

		return reply.code(200).send('Success update user');
	});

	// Obtain status of user
	fastify.get('/:id/stats', async (request, reply) => {
		const { id } = request.params;
		return reply.code(200).send('Status do usuário, vitórias, derrotas e mais');
	});

	// Upload an avatar
	fastify.post('/:id/avatar', async (request, reply) => {
		const { id } = request.params;
		return reply.code(200).send('O avatar foi enviado camarada');
	});
}

export default usersRoutes; 
