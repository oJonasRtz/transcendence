// Jest setup file for ESM modules
import { jest } from '@jest/globals';

// Increase timeout for database operations
jest.setTimeout(30000);

// Keep console.log active for test output, mock others to reduce noise
global.console = {
  ...console,
  // log: jest.fn(), // Commented out to allow console.log in tests
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
