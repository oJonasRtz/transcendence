import supertest from 'supertest';
import fs from 'node:fs/promises';
import fastify from '../index.js';

beforeAll(async () => {
	await fastify.ready();
});

afterAll(async () => {
	await fastify.close();
});

describe ('Que comece o torneio!!! Eeeeeeehhhhhhhh', () => {
	// Cria um torneio
	test('Que comece o torneio!!! Criando o torneio', async () => {
		const response = await supertest(fastify.server)
		.post('/api/tournaments')
		.send({})
		.expect(400);
	});

	// Lista todos os torneios
	test('Listando todos os torneios existentes', async () => {
		const response = await supertest(fastify.server)
		.get('/api/tournaments')
		.expect(200);
	});

	// Obter um torneio específico
	test('Obtendo um torneio específico', async () => {
		const response = await supertest(fastify.server)
		.get('/api/tournaments/1')
		.expect(200);
	});

	// editar um detalhe de um torneio
	test('Editando detalhes de um torneio', async () => {
		const response = await supertest(fastify.server)
		.patch('/api/tournaments/1')
		.send({})
		.expect(200);
	});

	// inscrever time/jogador
	test('Inscrevendo um time/jogador', async () => {
		const response = await supertest(fastify.server)
		.post('/api/tournaments/1/register')
		.send({})
		.expect(200);
	});

	// ranking do torneio
	test('Obtendo o ranking do torneio', async () => {
		const response = await supertest(fastify.server)
		.get('/api/tournaments/1/leaderboard')
		.send({})
		.expect(200);
	});

	// somente da partida, o identificador chave único
	test('Enviando o identificador chave único do torneio', async () => {
		const response = await supertest(fastify.server)
		.post('/api/tournaments/1/seed')
		.send({})
		.expect(200);
	});
});
