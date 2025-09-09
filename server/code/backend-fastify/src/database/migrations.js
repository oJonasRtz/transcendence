const fs = require('fs');
const path = require('path');
const DatabaseConnection = require('./connection');

class DatabaseMigrations {
  constructor() {
    this.dbConnection = new DatabaseConnection();
  }

  async runMigrations() {
    try {
      await this.dbConnection.connect();
      const db = this.dbConnection.getDatabase();
      
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of statements) {
        await this.executeStatement(db, statement.trim());
      }
      
      console.log('Database migrations completed successfully');
      await this.dbConnection.close();
      
    } catch (error) {
      console.error('Migration failed:', error);
      await this.dbConnection.close();
      throw error;
    }
  }

  executeStatement(db, statement) {
    return new Promise((resolve, reject) => {
      db.run(statement, (err) => {
        if (err) {
          console.error('Error executing statement:', statement);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

if (require.main === module) {
  const migrations = new DatabaseMigrations();
  migrations.runMigrations()
    .then(() => {
      console.log('Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}

module.exports = DatabaseMigrations;
