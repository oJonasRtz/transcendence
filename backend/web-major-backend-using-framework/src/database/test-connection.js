import DatabaseConnection from './connection';
import DatabaseQueries from './queries/queries.js';

async function testDatabaseConnection() {
  const dbConnection = new DatabaseConnection();
  
  try {
    console.log('Testing database connection...');
    await dbConnection.connect();
    
    const db = dbConnection.getDatabase();
    const queries = new DatabaseQueries(db);
    
    console.log('✓ Database connection successful');
    
    console.log('Testing basic database operations...');
    
    const tableCheck = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (tableCheck) {
      console.log('✓ Database tables exist');
    } else {
      console.log('⚠ Database tables not found - run migrations first');
    }
    
    const userCount = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log(`✓ Database query successful - ${userCount} users in database`);
    
    await dbConnection.close();
    console.log('✓ Database connection closed successfully');
    console.log('All database tests passed!');
    
  } catch (error) {
    onsole.error('✗ Database test failed:', error.message);
    await dbConnection.close();
    throw error;
  }
}

if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('Database test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database test failed:', error);
      process.exit(1);
    });
}

export default testDatabaseConnection;
