// console.log('=== Testing SQLite Connection ===');
// console.log(process.env.LOG_LEVEL);
// console.log(process.env.NODE_ENV);
// // Import logger directly to test it
// import { dbLogger } from '../utils/logger.js';

// // Test the logger first
// console.log('=== Testing Logger ===');
// dbLogger.debug('This is a debug message');
// dbLogger.info('This is an info message');
// dbLogger.warn('This is a warning message');
// dbLogger.error('This is an error message');

import DatabaseConnection from './connection.js';

async function testConnection() {
  try {
    const dbConnection = new DatabaseConnection();
    await dbConnection.connect();
    const db = dbConnection.getDatabase();
    console.log('Is connected:', dbConnection.isConnected);
    console.log('Connection ID:', dbConnection.connectionId);

    await dbConnection.close();
    console.log('Is connected:', dbConnection.isConnected);
    console.log('Connection ID:', dbConnection.connectionId);
    
    // const result = await new Promise((resolve, reject) => {
    //   db.get("SELECT 1 as test", (err, row) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(row);
    //     }
    //   });
    // });
    
    // console.log('Database connection test successful:', result);
    
    // const tableCheck = await new Promise((resolve, reject) => {
    //   db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(row);
    //     }
    //   });
    // });
    
    // if (tableCheck) {
    //   console.log('Database tables exist - schema is set up correctly');
    // } else {
    //   console.log('Database tables do not exist - run migrations first');
    // }
    
    // await dbConnection.close();
    // console.log('Database connection test completed successfully');
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    await dbConnection.close();
    throw error;
  }
}

// Run the test
testConnection();
