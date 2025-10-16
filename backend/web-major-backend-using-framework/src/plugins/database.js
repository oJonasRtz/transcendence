import fp from 'fastify-plugin';
import path from 'path';
import DatabaseConnection from '../database/connection.js';
import DatabaseMigration from '../database/migrations.js';

async function importAllQueries(fastify, db) {
	const queries = ['auth.js', 'users.js', 'relations.js', 'lobbies.js', 'channels.js', 'ranking.js', 'notifications.js'];
	const dbQueries = {};

	for ( const queryName of queries ) {
		let queryObject = await import(`../database/queries/${queryName}`);
		let extractQueryName = path.parse(queryName).name;
		let instance = new queryObject.default(db);
		dbQueries[extractQueryName] = instance;
	};
	fastify.decorate('dbQueries', dbQueries);
};

async function databasePlugin(fastify, options) {
  const dbConnection = new DatabaseConnection();
  
  try {
    await dbConnection.connect();
    const db = await dbConnection.getDatabase();
    
    await importAllQueries(fastify, db);
	  
    fastify.decorate('db', db);
    fastify.decorate('dbConnection', dbConnection);
    
    fastify.addHook('onClose', async (instance) => {
      await dbConnection.close();
    });
    
    console.log('Database plugin registered successfully');
    const migrations = new DatabaseMigration();
    await migrations.runMigrations()
    console.log('Migrations did with success');
    
  } catch (error) {
    console.error('Failed in database: ', error);
    throw error;
  }
}

export default fp(databasePlugin, {
  name: 'database',
  dependencies: []
});
