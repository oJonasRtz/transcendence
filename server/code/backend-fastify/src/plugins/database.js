import fp from 'fastify-plugin';
import DatabaseConnection from '../database/connection.js';
import DatabaseQueries from '../database/queries.js';

async function databasePlugin(fastify, options) {
  const dbConnection = new DatabaseConnection();
  
  try {
    await dbConnection.connect();
    const db = dbConnection.getDatabase();
    const queries = new DatabaseQueries(db);
    
    fastify.decorate('db', db);
    fastify.decorate('dbQueries', queries);
    fastify.decorate('dbConnection', dbConnection);
    
    fastify.addHook('onClose', async (instance) => {
      await dbConnection.close();
    });
    
    fastify.log.info('Database plugin registered successfully');
    
  } catch (error) {
    fastify.log.error('Failed to connect to database:', error);
    throw error;
  }
}

export default fp(databasePlugin, {
  name: 'database',
  dependencies: []
});
