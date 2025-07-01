# Backend Test Suite

This directory contains the comprehensive test suite for the Auth App backend.

## 📁 Test Structure

```
tests/
├── unit/                    # Unit tests for individual modules
│   ├── security.test.ts     # Security utilities tests
│   └── auth-middleware.test.ts # Authentication middleware tests
├── integration/             # Integration tests for API endpoints
│   ├── auth-api.test.ts     # Authentication API tests
│   ├── user-api.test.ts     # User API tests
│   └── app.test.ts          # App-level integration tests
└── helpers/                 # Test utilities and helpers
    └── database.ts          # Database testing utilities
```

## 🧪 Test Categories

### Unit Tests (`/unit`)
Tests individual functions and modules in isolation:
- **Security Utils**: Password hashing, JWT generation, validation functions
- **Middleware**: Authentication middleware components

### Integration Tests (`/integration`)
Tests complete API endpoints and application flow:
- **Auth API**: Registration, login, 2FA endpoints
- **User API**: User profile and information endpoints
- **App Integration**: Health checks, CORS, routing

### Test Helpers (`/helpers`)
Shared utilities for testing:
- **Database Helper**: In-memory database setup, test user creation, cleanup

## 🚀 Running Tests

### All Tests
```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch
```

### Specific Test Categories
```bash
# Run only unit tests
bun test tests/unit

# Run only integration tests
bun test tests/integration

# Run specific test file
bun test tests/unit/security.test.ts
```

### Using Test Runner
```bash
# Run with formatted output
bun run test-runner.ts
```

## 🛠️ Test Configuration

### Environment Setup
Tests use in-memory SQLite databases to avoid affecting production data:
- Each test gets a fresh database instance
- Automatic cleanup after each test
- Isolated test environments

### Mocking Strategy
- Database module is mocked for each test suite
- JWT secrets use test defaults
- Network requests are isolated

## 📊 Test Coverage

The test suite covers:
- **Security Functions**: 100% coverage of password hashing, JWT, validation
- **API Endpoints**: All authentication and user endpoints
- **Middleware**: Authentication and CORS middleware
- **Error Handling**: Invalid inputs, edge cases, rate limiting
- **Integration**: End-to-end API flows

## 🔧 Writing New Tests

### Test File Naming
- Unit tests: `*.test.ts` in `/unit` directory
- Integration tests: `*.test.ts` in `/integration` directory
- Follow descriptive naming: `feature-name.test.ts`

### Test Structure
```typescript
import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { createTestDatabase, cleanupTestDatabase } from '../helpers/database';

describe('Feature Name', () => {
  let testDb: any;

  beforeEach(() => {
    testDb = createTestDatabase();
    // Setup mocks
  });

  afterEach(() => {
    cleanupTestDatabase(testDb);
    mock.restore();
  });

  describe('Specific Functionality', () => {
    it('should do something specific', async () => {
      // Test implementation
    });
  });
});
```

### Best Practices
1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources in `afterEach`
3. **Descriptive Names**: Use clear, descriptive test names
4. **Edge Cases**: Test both success and failure scenarios
5. **Mocking**: Mock external dependencies appropriately

## 🐳 Docker Testing

Tests are integrated into the Docker build process:
- Tests run during Docker image build
- Failed tests prevent image creation
- CI/CD friendly output format

## 📝 Common Test Patterns

### API Testing
```typescript
const response = await app.request('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestData)
});

expect(response.status).toBe(200);
const result = await response.json() as ExpectedType;
expect(result.property).toBe(expectedValue);
```

### Database Testing
```typescript
const user = await createTestUser(testDb, 'test@example.com', 'hashedpassword');
const foundUser = getUserByEmail(testDb, 'test@example.com');
expect(foundUser).toBeDefined();
```

### Authentication Testing
```typescript
const token = generateJWT(user);
const response = await app.request('/api/protected', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🔍 Debugging Tests

### Verbose Output
```bash
bun test --verbose
```

### Debug Specific Test
```bash
bun test tests/unit/security.test.ts --verbose
```

### Inspect Database State
The database helper provides utilities to inspect test database state during debugging.

## 📈 Performance Testing

While not included in this basic suite, consider adding:
- Load testing for API endpoints
- Memory usage tests
- Concurrent request handling
- Rate limiting effectiveness

## 🚨 Troubleshooting

### Common Issues
1. **Database Lock**: Ensure proper cleanup in `afterEach`
2. **Mock Conflicts**: Call `mock.restore()` in `afterEach`
3. **Async Issues**: Use `await` for all async operations
4. **Import Paths**: Check relative paths from test directories

### Getting Help
- Check test output for specific error messages
- Verify import paths are correct for new test structure
- Ensure all dependencies are properly mocked 