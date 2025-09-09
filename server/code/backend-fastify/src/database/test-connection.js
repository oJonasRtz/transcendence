const DatabaseConnection = require('./connection');

async function testDatabaseConnection() {
  const dbConnection = new DatabaseConnection();
  
  try {
    console.log('Testing database connection...');
    await dbConnection.connect();
    
    const db = dbConnection.getDatabase();
    
    const result = await new Promise((resolve, reject) => {
      db.get("SELECT 1 as test", (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    console.log('Database connection test successful:', result);
    
    const tableCheck = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    
    if (tableCheck) {
      console.log('Database tables exist - schema is set up correctly');
    } else {
      console.log('Database tables do not exist - run migrations first');
    }
    
    await dbConnection.close();
    console.log('Database connection test completed successfully');
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    await dbConnection.close();
    throw error;
  }
}

if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testDatabaseConnection;
