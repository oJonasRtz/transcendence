import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import config from './config.js';

class DatabaseConnection {
  constructor() {
    this.db = null;
  }

  async connect() {
    if (this.db) return this.db;
      this.db = await open({
		filename: config.database.filename, 
		driver: sqlite3.Database
	});
	console.log('Connected SQLite database (promise API)');
	return (this.db);
  }

  async close() {
	if (this.db)
		await this.db.close();
	this.db = null;
	console.log('Database connection closed');
}
  getDatabase() {
	if (!this.db) {
		throw new Error('Database not connected. Call connect() first');
	}
    return this.db;
  }
}

export default DatabaseConnection;
