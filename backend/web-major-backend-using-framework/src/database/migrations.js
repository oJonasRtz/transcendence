import fs from 'node:fs/promises';
import path from 'path';
import DatabaseConnection from './connection.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inputInDataBase(db, sql) {
	await db.exec(sql);
}

class DatabaseMigrations {
  constructor() {
    this.dbConnection = new DatabaseConnection();
  }

  async runMigrations() {
    try {
      await this.dbConnection.connect();
      const db = await this.dbConnection.getDatabase();
      
      const migrations = ['authSchema.sql', 'usersSchema.sql', 'relationsSchema.sql', 'lobbiesSchema.sql', 'channelsSchema.sql'];

      for (const schemaSQL of migrations) {

	let schemaPath = path.join(__dirname, 'schemas', schemaSQL);
	let schema = await fs.readFile(schemaPath, 'utf8');
      
	await inputInDataBase(db, schema);
} 
      console.log('Database migrations completed successfully');
      
    } catch (error) {
      console.error('Migration failed:', error);
      await this.dbConnection.close();
      throw error;
    }
  }

  async executeStatement(db, statement) {
	await db.run(statement);
  }
}

export default DatabaseMigrations;
