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
	fastify.post('/logout/:id', async (request, reply) => {
		const { id } = request.params;
		try {
			await fastify.dbQueries.auth.logoutUser(id);
		} catch (err) {
			return reply.code(401).send({ error: "User doesn't exist"});
		}
		return reply.code(200).send('Logout successfully');
	});

	// Refresh -> validate the access again
	fastify.post('/refresh', async (request, reply) => {
		return reply.code(200).send('Atualização da sessão');
	});

	// Logout -> invalid the refresh

	fastify.post('/forgot/:id', async (request, reply) => {
		const { id } = request.params;
		const { email, newPassword } = request.body;
		try {
			const userId = parseInt(id, 10);
			await fastify.dbQueries.auth.forgotPass(userId, email, newPassword);
		} catch (err) {
			if (err.message === "MISSING_INPUT")
				return reply.code(400).send('Need a valid input');
			else if (err.message === "SAME_PASSWORD")
				return reply.code(409).send('Same password');
			else if (err.message === "NOT_FOUND")
				return reply.code(404).send('Not found a valid user');
			else if (err.message === "INTERNAL_SERVER_ERROR")
				return reply.code(500).send('Internal Server Error');
			return reply.code(401).send('Invalid action happened');
		}
		return reply.code(200).send('Password changed successfully');
	});

	// Get information about the login
	fastify.get('/me', async (request, reply) => {
		return reply.code(200).send('Pedindo informações sobre o login atual');
	});
};

export default authRoutes;
