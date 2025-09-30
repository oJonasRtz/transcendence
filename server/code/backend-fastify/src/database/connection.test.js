// Import Node.js built-in test framework functions:
// - test: defines a single test case with name and test function
// - describe: groups related tests together into a test suite
// - afterEach: runs cleanup code after each test completes
import { test, describe, afterEach } from 'node:test';
// Import Node.js built-in assertion library:
// - assert: provides functions to check if conditions are true/false
import assert from 'node:assert';
import DatabaseConnection from './connection.js';

let dbConnection;

// afterEach: cleanup function that runs after every single test
// Ensures each test starts with a clean state
afterEach(async () => {
  if (dbConnection?.isConnected) {
    await dbConnection.close();
  }
});

// describe: creates a test suite named "DatabaseConnection" 
// Groups all related tests for this class together
describe('DatabaseConnection', () => {
  
  // test: defines individual test case
  // First parameter: descriptive name of what we're testing
  // Second parameter: function that runs the actual test
  test('should throw error when getting database before connect', () => {
    dbConnection = new DatabaseConnection();
    // assert.throws: checks that the function throws an error with expected message
    assert.throws(() => dbConnection.getDatabase(), {
      message: 'Database not connected. Call connect() first.'
    });
  });

  test('should connect and return database instance', async () => {
    dbConnection = new DatabaseConnection();
    const db = await dbConnection.connect();
    
    // assert.ok: checks that value is truthy (not null, undefined, false, etc.)
    assert.ok(db);
    // assert.strictEqual: checks that two values are exactly equal (===)
    assert.strictEqual(dbConnection.isConnected, true);
    assert.strictEqual(db, dbConnection.getDatabase());
  });

  test('should handle multiple connect calls safely', async () => {
    dbConnection = new DatabaseConnection();
    const db1 = await dbConnection.connect();
    const db2 = await dbConnection.connect();
    
    // Should return the same database instance
    assert.strictEqual(db1, db2);
  });

  test('should close connection and reset state', async () => {
    dbConnection = new DatabaseConnection();
    await dbConnection.connect();
    
    await dbConnection.close();
    assert.strictEqual(dbConnection.isConnected, false);
    // After close, getDatabase should throw again
    assert.throws(() => dbConnection.getDatabase());
  });

  test('should handle multiple close calls safely', async () => {
    dbConnection = new DatabaseConnection();
    await dbConnection.connect();
    await dbConnection.close();
    
    // assert.doesNotReject: checks that async function doesn't throw/reject
    await assert.doesNotReject(() => dbConnection.close());
  });

  test('should have unique connection IDs', () => {
    const conn1 = new DatabaseConnection();
    const conn2 = new DatabaseConnection();
    
    // assert.notStrictEqual: checks that two values are NOT equal (!==)
    assert.notStrictEqual(conn1.connectionId, conn2.connectionId);
    assert.ok(conn1.connectionId.length > 0);
  });

  test('original test scenario - fixed', async () => {
    dbConnection = new DatabaseConnection();
    
    // This should throw (original bug was missing this check)
    assert.throws(() => dbConnection.getDatabase());
    
    // These should work fine
    await dbConnection.connect();
    await dbConnection.connect(); // Second connect should be safe
    const db = dbConnection.getDatabase();
    assert.ok(db);
    
    await dbConnection.close();
    await dbConnection.close(); // Second close should be safe
  });
});
