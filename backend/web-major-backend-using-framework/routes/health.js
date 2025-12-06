async function healthRoutes(fastify){
	fastify.get('/api/health/db', async (request, reply) => {
	try {
		const userCount = await new Promise((resolve, reject) => {
		fastify.db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
		if (err) reject(err);
		else resolve(row.count);
		});
	});
    	return reply.send({ 
		status: 'healthy', 
		database: 'connected',
 		userCount: userCount
		});
	} catch (error) {
		fastify.log.error(error);
		return reply.code(500).send({ error: 'Database connection failed' });
	}
});
}

export default healthRoutes;
