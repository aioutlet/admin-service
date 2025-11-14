export default {
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/app.js',
    '!src/core/config.js',
    '!src/core/logger.js',
    '!src/services/dapr.client.js',
    '!src/services/dapr.secretManager.js',
    '!src/controllers/operational.controller.js',
    '!src/middlewares/correlationId.middleware.js',
    '!src/utils/correlationId.helper.js',
    '!src/utils/dependencyHealthChecker.js',
    '!src/utils/health.js',
    '!src/validators/config.validator.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 90,
      lines: 95,
      statements: 95,
    },
  },
};
