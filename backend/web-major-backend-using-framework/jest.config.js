export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000
};
