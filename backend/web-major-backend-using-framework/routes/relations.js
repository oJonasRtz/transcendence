async function relationsRoutes(fastify, options) {

	// Retorna todos os amigos do usuário especificado
	fastify.get('/:userId', async (request, reply) => {
		return reply.code(200).send('Aqui estão todos os seus amigos');
	});

	// Tentativa de virar amigo, ainda tem que ser aceito
	fastify.post('/:userId', async (request, reply) => {
		return reply.code(200).send('Pedido de amizade enviado');
	});

	// Autoriza virar amigo
	fastify.post('/accept/:userId', async (request, reply) => {
		return reply.code(200).send('Pedido de amizade autorizado');
	});

	// Remove o amigo
	fastify.delete('/:userId', async (request, reply) => {
		return reply.code(204).send();
	});
}

export default relationsRoutes;
