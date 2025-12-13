import Fastify from 'fastify';
import dbPlugin from './db.js';

const fastify = Fastify({ logger: true });

await fastify.register(dbPlugin, { path: 'mydb.sqlite' });

fastify.post('/users', async (request, reply) => {
    const { username, nickname } = request.body;

    const insert = fastify.db.prepare('INSERT INTO users (username, nickname) VALUES (?, ?)');
    const result = insert.run(username, nickname);

    const getUser = fastify.db.prepare('SELECT * FROM users WHERE id = ?');
    const user = getUser.get(result.lastInsertRowid);

    return reply.status(201).send(user);
});

fastify.get('/users', async (request, reply) => {
    const users = fastify.db.prepare('SELECT * FROM users').all();
    return { users };
});

await fastify.listen({ port: 3002, host: '0.0.0.0' });
