import supertest from 'supertest';
import AuthUtils from '../src/utils/auth.js';
import fs from 'fs';
import path from 'path';
import fastify from '../index.js';

beforeAll(async () => {
	await fastify.ready();
});

beforeEach(async () => {
	await AuthUtils.deleteAuthTable(fastify.db);
});

afterAll(async () => {
	await fastify.close();
});

describe('Testando autenticação do usuário', () => {
	test('criação de usuário', async () => {
		const user = {
			username: 'IndianaJones',
			email: 'indianaJones@gmail.com',
			password: 'IssoÉUmaSenhaForte'
		};
		const response = await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(201);

		console.log('Conteúdo de auth');
		const rows = await fastify.db.all('SELECT * FROM auth');
		console.table(rows);

		expect(rows.length).toBe(1);
		expect(rows[0].username).toBe(user.username);
		expect(rows[0].email).toBe(user.email);
	});
	test('login do usuário', async () => {
		const response = await supertest(fastify.server)
		.post('/api/auth/users/login')
		.send({})
		.expect(200);
	});
	test('refresh do usuário', async () => {
		const response = await supertest(fastify.server)
		.post('/api/auth/users/refresh')
		.send({})
		.expect(200);
	});
	test('logout do usuário', async () => {
		const response = await supertest(fastify.server)
		.post('/api/auth/users/logout')
		.send({})
		.expect(200);
	});
	test('esqueceu a senha', async () => {
		const response = await supertest(fastify.server)
		.post('/api/auth/users/forgot')
		.send({})
		.expect(200);
	});
	test('obter os dados do usuário logado', async () => {
		const response = await supertest(fastify.server)
		.get('/api/auth/users/me')
		.expect(200);
	});
});
