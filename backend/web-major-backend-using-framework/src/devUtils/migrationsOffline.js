import path from 'path'
import DatabaseConnection from '../database/connection.js';
import DatabaseMigration from '../database/migrations.js';

try {
	const dbConnection = new DatabaseConnection();

	await dbConnection.connect();
	const db = await dbConnection.getDatabase();

	const migrations = new DatabaseMigration();
	await migrations.runMigrations()
	console.log('Migrations did with success');
} catch (err) {
	console.error('Unfortunately migrations did not have success:', err.message);
	process.exit(1);
}
