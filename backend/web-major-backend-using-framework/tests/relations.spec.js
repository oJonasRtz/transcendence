import supertest from 'supertest';
import fs from 'node:fs/promises';
import fastify from '../index.js';

beforeAll(async () => {
	await fastify.ready();
});

afterAll(async () => {
	await fastify.close();
});

describe ('Começando os testes das relações sociais dos usuários', () => {

	// Receber todos os amigos do usuário especificado
	test('Retorna todos os usuários do Id selecionado', async () => {
		const response = await supertest(fastify.server)
		.get('/api/friends/1')
		.expect(200);
	});

	// Enviar pedido de amizade para o usuário especificado
	test('Enviar convite de amizade para o usuário especificado por ID', async () => {
		const response = await supertest(fastify.server)
		.post('/api/friends/1')
		.expect(200);
	})

	// Autorizar virar amigo / Aceitar convite
	test('Aceitar o convite de amizade', async () => {
		const response = await supertest(fastify.server)
		.post('/api/friends/accept/1')
		.expect(200);
	});

	// Remove o amigo
	test('Remover o amigo adicionado', async () => {
		const response = await supertest(fastify.server)
		.delete('/api/friends/1')
		.expect(204);
	});
});
