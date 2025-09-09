const Fastify = require('fastify');
const pino = require('pino'); // added pino
// const logStream = pino.destination('../../../infrastructure/logging/logs/app.log'); // use without docker
const logStream = pino.destination('/app/app.log'); // use with docker
const app = Fastify({ logger: { stream : logStream} }); // added { stream : logStream}
const AuthUtils = require('./src/utils/auth');

app.register(require('./src/plugins/database'));

app.get('/', async () => ({hello: 'world', database: 'connected'}));

app.get('/health', async () => {
	return {status: 'ok', runtime: 'node', version: process.version}
});

app.get('/api/users', async (request, reply) => {
	try {
		const users = await app.dbQueries.getAllUsers();
		return reply.send({ users });
	} catch (error) {
		app.log.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
});

app.get('/api/users/:username', async (request, reply) => {
	try {
		const user = await app.dbQueries.getUserByUsername(request.params.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		return reply.send({ user });
	} catch (error) {
		app.log.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
});

app.post('/api/users/register', async (request, reply) => {
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
		
		const existingUser = await app.dbQueries.getUserByUsername(username);
		if (existingUser) {
			return reply.code(409).send({ error: 'Username already exists' });
		}
		
		const existingEmail = await app.dbQueries.getUserByEmail(email);
		if (existingEmail) {
			return reply.code(409).send({ error: 'Email already exists' });
		}
		
		const user = await app.dbQueries.createUser(username, email, password);
		return reply.code(201).send({ user: { id: user.id, username: user.username, email: user.email } });
		
	} catch (error) {
		app.log.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
});

app.post('/api/tournaments', async (request, reply) => {
	try {
		const { name, maxParticipants } = request.body;
		
		if (!name || name.trim().length === 0) {
			return reply.code(400).send({ error: 'Tournament name is required' });
		}
		
		const tournament = await app.dbQueries.createTournament(name.trim(), maxParticipants);
		return reply.code(201).send({ tournament });
		
	} catch (error) {
		app.log.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
});

app.get('/api/tournaments', async (request, reply) => {
	try {
		const tournaments = await app.dbQueries.getAllTournaments();
		return reply.send({ tournaments });
	} catch (error) {
		app.log.error(error);
		return reply.code(500).send({ error: 'Internal server error' });
	}
});

app.get('/api/health/db', async (request, reply) => {
	try {
		const userCount = await new Promise((resolve, reject) => {
			app.db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
				if (err) reject(err);
				else resolve(row.count);
			});
		});
		
		return reply.send({ 
			status: 'healthy', 
			database: 'connected',
			userCount: userCount
		});
	} catch (error) {
		app.log.error(error);
		return reply.code(500).send({ error: 'Database connection failed' });
	}
});

/* Only for test */
app.get('/boom', async () => {
	throw new Error('Boom');
});

app.setNotFoundHandler((req, reply) => {
	reply.code(404).send({
		error: 'Not found',
		method: 'req.method',
		path: req.url,
	});
});

app.setErrorHandler((err, req, reply) => {
	req.log.error({err}, 'unhandled error');

	const isDev = process.env.NODE_ENV !== 'production';

	reply.code(err.statusCode ?? 500).send({
		error: 'Internal Server error',
		message: isDev ? err.message : 'Something went wrong',
		...(isDev ? {stack: err.stack}: {})
	});
});

app.listen({host: '0.0.0.0', port: 3000});
