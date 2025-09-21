import supertest from 'supertest';
import AuthUtils from '../src/utils/auth.js';
import fs from 'fs';
import path from 'path';
import fastify from '../index.js';
import { jest } from '@jest/globals';

jest.setTimeout(30000);
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
	test('criação de usuário, argumentos válidos e inválidos', async () => {
		const user = {
			username: 'IndianaJones',
			email: 'indianajones@gmail.com',
			password: 'Isso12#ÉUmaSen@haForte'
		};
		const response = await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(201);

		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(409);

		console.log('Conteúdo de auth');
		const rows = await fastify.db.all('SELECT * FROM auth');
		console.table(rows);

		expect(rows.length).toBe(1);
		expect(rows[0].username).toBe(user.username);
		expect(rows[0].email).toBe(user.email);

		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send({
			username: 'IndianaJones',
			email: 'indianajones@gmail.com'
		})
		.expect(400);

		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send({
			username: 'HanSolo',
			password: 'Senha@123Forte#'
		})
		.expect(400);

		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send({
			email: 'princessleia@gmail.com',
			password: 'leia@123LhusbandLuke!'
		})
		.expect(400);

		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send({})
		.expect(400);

		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send({
			username: 'Shanks',
			email: 'shanksyonkou@gmail.com',
			password: 'shanks'
		})
			.expect(400);
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
			password: 'LukeMorreueDarthVenceuY12!'
		})
		.expect(200);

		await supertest(fastify.server)
		.post('/api/auth/users/login')
		.send({
			username: 'DarthVader',
			email: 'darthvader@gmail.com',
			password: 'Luke123@!'
		})
		.expect(401);
	});
	test('login de usuário que passou apenas o email ou username com password', async () => {
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
			email:'darthvader@gmail.com',
			password: 'LukeMorreueDarthVenceuY12!'
		})
		.expect(200);

		await supertest(fastify.server)
		.post('/api/auth/users/login')
		.send({
			username: 'DarthVader',
			password: 'LukeMorreueDarthVenceuY12!'
		})
		.expect(200);

		await supertest(fastify.server)
		.post('/api/auth/users/login')
		.send({
			username: 'DarthMaul',
			email: 'darthmaul@gmail.com',
			password: 'dartMaul21SITH@bomDeBriga'
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
