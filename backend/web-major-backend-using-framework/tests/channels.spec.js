import supertest from 'supertest';
import fs from 'node:fs/promises';
import fastify from '../index.js';

beforeAll(async () => {
	await fastify.ready();
});

afterAll(async () => {
	await fastify.close();
});

describe ('Começando os testes dos canais dos usuários', () => {
	// obter todos os canais
	test('obtendo todos os canais de usuários disponíveis', async () => {
		const response = await supertest(fastify.server)
		.get('/api/channels/')
		.expect(200);
	});

	// Obter o histórico de mensagens de um canal
	test('obtendo o histórioc de mensagens de um canal', async () => {
		const response = await supertest(fastify.server)
		.get('/api/channels/1/messages')
		.expect(200);
	});

	// Enviar uma mensagem no canal
	test('enviando uma mensagem no canal alvo', async () => {
		const response = await supertest(fastify.server)
		.post('/api/channels/1/messages')
		.send({})
		.expect(200);
	});

	// Saber o status de todos no canal
	test('sabendo se podemos saber quem está online, offline, lobby, match e etc.', async () => {
		const response = await supertest(fastify.server)
		.get('/api/channels/1/presence')
		.send({})
		.expect(200);
	});

	// Criar um novo canal
	test('criando um novo canal para testar', async () =>{
		const response = await supertest(fastify.server)
		.post('/api/channels/create')
		.send({})
		.expect(200);
	});
});
