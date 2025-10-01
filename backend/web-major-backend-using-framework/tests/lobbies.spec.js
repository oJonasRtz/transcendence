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

describe ('Começando os testes das salas de espera, lobbies', () => {
	// Obtendo todos os lobbies disponíveis 
	test('Obter todas as salas de espera disponíveis', async () => {
		await supertest(fastify.server)
		.get('/api/lobbies')
		.expect(204);
	});

	// Criando um novo lobby
	test('Criando nova sala de espera', async () => {
		await supertest(fastify.server)
		.post('/api/lobbies')
		.send({
			"lobby_name": "ParadiseOfLinux",
			"game_mode": "Survival"
		})
		.expect(201);
	});

	// Retornando uma sala de espera específica
	test('Retornando uma sala de espera específica', async () => {

		await supertest(fastify.server)
                .post('/api/lobbies')
                .send({
                        "lobby_name": "OnePiece",
                        "game_mode": "survival"
                })
                .expect(201);

		await supertest(fastify.server)
		.get('/api/lobbies/1')
		.expect(200);
	});

	// Teste de adição de usuário em uma sala lobby
	test('Adicionando novo usuário na lista de espera', async () => {
		await supertest(fastify.server)
		.post('/api/users/register')
		.send({
			"username": "Shanks",
			"nickname": "red-haired",
			"email": "SOUOSHANKS@gmail.com"
		})
		.expect(201);
		await supertest(fastify.server)
                .post('/api/lobbies')
                .send({
                        "lobby_name": "OnePiece",
                        "game_mode": "survival"
                })
                .expect(201);

		await supertest(fastify.server)
		.post('/api/lobbies/1/join')
		.send({
			"username": "Shanks",
			"nickname": "red-haired",
			"email": "SOUOSHANKS@gmail.com",
			"lobby_name": "OnePiece"
		})
		.expect(201);
	});
	
	// Remover um usuário da sala de espera
	test.skip('Remover um usuário do lobby', async () => {
		await supertest(fastify.server)
                .post('/api/lobbies')
                .send({
                        "lobby_name": "OnePiece",
                        "game_mode": "Survival"
                })
                .expect(201);

                await supertest(fastify.server)
                .post('/api/lobbies/1/join')
                .send({
                        "username": "Shanks",
                        "nickname": "red-haired",
                        "email": "SOUOSHANKS@gmail.com",
                        "lobby_name": "OnePiece"
                })
                .expect(201);

		await supertest(fastify.server)
		.post('/api/lobbies/1/leave')
		.send({
			"username": "Shanks",
                        "nickname": "red-haired",
                        "email": "SOUOSHANKS@gmail.com",
                        "lobby_name": "OnePiece"
		})
		.expect(204);
	});
});
