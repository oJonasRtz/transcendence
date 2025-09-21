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
			password: 'Isso12#ÉUmaSen@haForte'
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
	test('criação de usuário inválido sem senha', async () => {
		const user = {
			username: 'HanSolo',
			email: 'hansolo@gmail.com',
		}
		const response = await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(400);
	});
	test('criação de usuário inválido sem email', async () => {
		const user = {
			username: 'DarthVader',
			password: 'Senha@123FORTE#'
		}
		const response = await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(400);
	});
	test('criação de usuário inválido sem username', async () => {
		const user = {
			email: 'PrincessLeia@hotmail.com',
			password: 'princessLeia&Luke#2'
		}
		const response = await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(400);
	});
	test('criação de usuário com senha fraca', async () => {
		const user = {
			username: 'Luke Skywalker',
			email: 'luke@gmail.com',
			password: 'eusouoluke'
		};
		const response = await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(400);
	});
	test('login do usuário correto (registro e consulta)', async () => {
		const user = { 
			username: 'LukeSkywalker',
			email: 'luke@gmail.com',
			password: 'Casei#123PrincessLei@'
		}
		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(201);

		await supertest(fastify.server)
		.post('/api/auth/users/login')
		.send(user)
		.expect(200);

		console.log('Conteúdo de auth');
                const rows = await fastify.db.all('SELECT * FROM auth');
                console.table(rows);

                expect(rows.length).toBe(1);
                expect(rows[0].username).toBe(user.username);
                expect(rows[0].email).toBe(user.email);
	});
	test('login do usuário incorreto (registro e consulta)', async () => {
		const user = {
			username: 'DarthVader',
			email: 'darthvader@gmail.com',
			password: 'LukeMorreueDarthVenceuY12!'
		}
		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(201);

		await supertest(fastify.server)
		.post('/api/auth/users/login')
		.send({
			username: 'DarthVader',
			email: 'darthvader@gmail.com',
			password: 'Luke123@!'
		})
		.expect(401);
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
