import AuthUtils from '../src/utils/auth.js'

async function authRoutes (fastify, options) {
	// Register of user
	fastify.post('/register', async (request, reply) => {
		const { username, email, password } = request.body;
		try {
			if (!AuthUtils.validateUsername(username) || !AuthUtils.validateEmail(email) || !AuthUtils.validatePassword(password))
				return reply.code(400).send({ error: 'Invalid input'});
			const strength = await AuthUtils.calculatePassWordStrength(password);
			if (strength !== 5)
				return reply.code(400).send({ error: 'Invalid input'});
			await fastify.dbQueries.auth.registerUser(username, email, password);
		} catch (err) {
			return reply.code(409).send({ error: 'Conflict' });
		}
		return reply.code(201).send({ message: 'User registering successfully' });
	});

	// Login
	fastify.post('/login', async (request, reply) => {
		const { username, email, password } = request.body;

		if ((!username && !email) || !password)
			return reply.code(400).send({ error: 'Username/email and password required'});
		try {
			await fastify.dbQueries.auth.loginUser(username, email, password);
		} catch (err) {
			return reply.code(401).send({ error: 'Invalid input found' });
		}
		return reply.code(200).send('Login success!!!');
	});
	// Logout
	fastify.post('/logout', async (request, reply) => {
		return reply.code(200).send('Logout efetuado com sucesso');
	});

	// Refresh -> validate the access again
	fastify.post('/refresh', async (request, reply) => {
		return reply.code(200).send('Atualização da sessão');
	});

	// Logout -> invalid the refresh

	fastify.post('/forgot', async (request, reply) => {
		return reply.code(200).send('Recuperação da senha');
	});

	// Get information about the login
	fastify.get('/me', async (request, reply) => {
		return reply.code(200).send('Pedindo informações sobre o login atual');
	});
};

export default authRoutes;
