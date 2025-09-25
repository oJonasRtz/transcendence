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

describe ('Começando os testes focando no usuário', () => {
	// Atualizar os dados cadastrados de um usuário (avatar, nickname, email, senha...)
	test('Atualização parcial do usuário', async () => {
		const response = await supertest(fastify.server)
		.patch('/api/users/update/1')
		.send({})
		.expect(200);
	});

	// Remover um usuário do banco de dados
	test('Remover um usuário', async () => {
		const response = await supertest(fastify.server)
		.delete('/api/users/remove/1')
		.expect(204);
	});

	// Receber a lista completa de usuários cadastrados
	test('Receber a lista completa de usuários do cadastrados', async () => {
		const response = await supertest(fastify.server)
		.get('/api/users')
		.expect(200);
	});

	// Receber usuário especificado por ID
	test('Receber o usuário especificado pelo ID', async () => {
		const response = await supertest(fastify.server)
		.get('/api/users/:id')
		.expect(200);
	});

	// Receber usuário especificado por query
	test('Receber o usuário especificado pelo query', async () => {
		const response = await supertest(fastify.server)
		.get('/api/users/search')
		.expect(200);
	});

	// Registrar novo usuário
	test('Registrar novo usuário no banco de dados', async () => {
		const user = {
			username: 'SatoroGojo',
			nickname: 'Gojo',
			email: 'thestrongest@gmail.com',
			password: 'SatoroGojo123@123!'
		};
		await supertest(fastify.server)
		.post('/api/auth/users/register')
		.send(user)
		.expect(201);

		console.log('Conteúdo de users');
                const rows = await fastify.db.all('SELECT * FROM users');
                console.table(rows);

                expect(rows.length).toBe(1);
                expect(rows[0].username).toBe(user.username);
                expect(rows[0].email).toBe(user.email);
		expect(rows[0].nickname).toBe(user.nickname);

		await supertest(fastify.server)
		.post('/api/users/register')
		.send({
			username: 'SatoroGojo',
			nickname: 'Gojo',
			email: 'thestrongest@gmail.com',
			password: 'PasswordDifferentGojo123!!!'
		})
		.expect(401);

		await supertest(fastify.server)
		.post('/api/users/register')
		.send({
			username: 'Sukuna',
			nickname: 'theKingOfCurses',
			email: 'thestrongest@gmail.com',
			password: 'PasswordDifferentGojo123!!!'
		})
		.expect(401);
	})

	// Substituir completamente um novo usuário
	test('Atualizar por completo um novo usuário', async () => {
		const response = await supertest(fastify.server)
		.put('/api/users/update/1')
		.send({})
		.expect(200);
	});

	// Obter dados do usuário
	test('Obter dados do usuário especificado por ID', async () => {
		const response = await supertest(fastify.server)
		.get('/api/users/teste/stats')
		.expect(200);
	});

	// Fazer o upload de um avatar
	test('Enviar um avatar ao banco de dados, para o usuário especificado', async () => {
		const response = supertest(fastify.server)
		.post('/api/users/1/avatar')
		.expect(200);
	});
})
