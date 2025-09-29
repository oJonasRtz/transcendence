import supertest from 'supertest';
import fs from 'node:fs/promises';
import fastify from '../index.js';

beforeAll(async () => {
	await fastify.ready();
});

afterAll(async () => {
	await fastify.close();
});

describe ('Começando os testes das salas de espera, lobbies', () => {
	// Obtendo todos os lobbies disponíveis 
	test('Obter todas as salas de espera disponíveis', async () => {
		const response = await supertest(fastify.server)
		.get('/api/lobbies')
		.expect(200);
	});

	// Criando um novo lobby
	test('Criando nova sala de espera', async () => {
		const response = await supertest(fastify.server)
		.post('/api/lobbies/')
		.send({})
		.expect(400);
	});

	// Retornando uma sala de espera específica
	test('Retornando uma sala de espera específica', async () => {
		const response = await supertest(fastify.server)
		.get('/api/lobbies/1')
		.expect(200);
	});

	// Teste de adição de usuário em uma sala lobby
	test('Adicionando novo usuário na lista de espera', async () => {
		const response = await supertest(fastify.server)
		.post('/api/lobbies/1/join')
		.send({})
		.expect(400);
	});
	
	// Remover um usuário da sala de espera
	test('Remover um usuário do lobby', async () => {
		const response = await supertest(fastify.server)
		.post('/api/lobbies/1/leave')
		.send({})
		.expect(200);
	});

	// O jogo começou
	test('O jogo começou, aviso a sala lobby', async () => {
		const response = await supertest(fastify.server)
		.post('/api/lobbies/1/start')
		.send({})
		.expect(200);
	});
});
