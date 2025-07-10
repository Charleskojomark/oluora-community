module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/utils/logger.js',
    '!src/swagger.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 30000, // Increased to 30 seconds
  // Force Jest to run tests sequentially to avoid database conflicts
  maxWorkers: 1,
  // Set up environment variables
  setupFiles: ['<rootDir>/src/tests/env.setup.js'],
  // Add some additional configuration for better test isolation
  forceExit: true,
  detectOpenHandles: true,
  // Increase timeout for setup/teardown
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  globalSetup: undefined,
  globalTeardown: undefined
};