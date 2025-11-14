# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage of the admin-service, including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
tests/
├── unit/                          # Unit tests for individual components
│   ├── admin.controller.test.js   # Admin controller logic
│   ├── admin.validator.test.js    # Validation functions
│   ├── async.handler.test.js      # Async handler middleware
│   ├── auth.middleware.test.js    # Authentication middleware
│   ├── error.response.test.js     # Error response utility
│   ├── home.controller.test.js    # Home controller logic
│   └── user.service.client.test.js # User service client
├── integration/                   # Integration tests with mocked dependencies
│   ├── admin.routes.test.js       # Admin routes integration
│   └── home.routes.test.js        # Home routes integration
├── e2e/                           # End-to-end tests (require running services)
│   └── admin-api.e2e.test.js      # Full API tests
└── shared/                        # Shared test utilities
    ├── fixtures/                  # Test data
    └── helpers/                   # Helper functions

```

## Running Tests

### All Tests (Unit + Integration + E2E)
```bash
npm test
```
**Note**: E2E tests require external services (admin-service, auth-service, user-service, message-broker-service) to be running.

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### E2E Tests Only
```bash
npm run test:e2e
```

### With Code Coverage
```bash
npm run test:coverage
```

## Code Coverage

Current code coverage for tested modules:

| Module                  | Statements | Branches | Functions | Lines |
|-------------------------|------------|----------|-----------|-------|
| admin.controller.js     | 100%       | 100%     | 100%      | 100%  |
| admin.validator.js      | 89.47%     | 87.5%    | 100%      | 100%  |
| auth.middleware.js      | 97.61%     | 84.61%   | 85.71%    | 97.56%|
| async.handler.js        | 100%       | 100%     | 100%      | 100%  |
| error.response.js       | 100%       | 100%     | 100%      | 100%  |
| home.controller.js      | 100%       | 75%      | 100%      | 100%  |
| user.service.client.js  | 100%       | 100%     | 100%      | 100%  |
| admin.routes.js         | 100%       | 100%     | 100%      | 100%  |
| home.routes.js          | 100%       | 100%     | 100%      | 100%  |

**Overall Coverage**: 97.65% statements, 90.66% branches, 96.42% functions, 99.16% lines

Coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - Interactive HTML report
- `coverage/lcov.info` - LCOV format for CI/CD integration
- `coverage/coverage-summary.json` - JSON summary

## Test Categories

### Unit Tests (46 tests)
Tests individual functions and components in isolation with all dependencies mocked:
- Controller logic and validation
- Middleware behavior
- Service client calls
- Utility functions

### Integration Tests (29 tests)
Tests the integration between components (routes + middleware + controllers) with mocked external services:
- Route handling
- Middleware chains
- Request/response flow
- Authentication and authorization

### E2E Tests (13 tests)
Full end-to-end tests that require actual services to be running:
- Complete API workflows
- Service-to-service communication
- Real authentication flows
- Database interactions

**Prerequisites for E2E tests**:
- Admin service running on http://localhost:3010
- Auth service running on http://localhost:3001
- User service running on http://localhost:3002
- Message broker service running on http://localhost:4000

## Test Utilities

### Shared Helpers
Located in `tests/shared/helpers/`:
- `api.js` - HTTP client utilities
- `auth.js` - Authentication helpers
- `user.js` - User management helpers
- `database.js` - Database utilities
- `assertions.js` - Custom assertions

### Fixtures
Located in `tests/shared/fixtures/`:
- `users.js` - Sample user data

## Writing New Tests

### Unit Test Example
```javascript
import { myFunction } from '../../src/path/to/module.js';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Integration Test Example
```javascript
import request from 'supertest';
import express from 'express';
import routes from '../../src/routes/my.routes.js';

describe('My Routes Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/my', routes);
  });

  it('should handle request', async () => {
    const response = await request(app).get('/api/my/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example CI configuration
- name: Run tests
  run: npm run test:coverage
  
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Best Practices

1. **Write tests first** - Follow TDD when adding new features
2. **Keep tests isolated** - Each test should be independent
3. **Mock external dependencies** - Don't rely on external services in unit/integration tests
4. **Use descriptive names** - Test names should clearly state what they test
5. **Test edge cases** - Don't just test the happy path
6. **Keep tests fast** - Unit tests should run in milliseconds
7. **Maintain coverage** - Aim for >90% coverage on new code

## Troubleshooting

### Tests failing with "Required services are not available"
This is expected for E2E tests. Either:
1. Start all required services, or
2. Run only unit and integration tests: `npm run test:unit && npm run test:integration`

### Coverage threshold not met
Check which files are not covered by running:
```bash
npm run test:coverage
```
Then review the uncovered lines in the report.

### Tests timing out
Increase the timeout in jest.config.js or for specific tests:
```javascript
jest.setTimeout(10000); // 10 seconds
```

## Maintenance

- Review and update tests when modifying code
- Add tests for new features before merging
- Keep test dependencies up to date
- Regularly run the full test suite
- Monitor coverage trends

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
