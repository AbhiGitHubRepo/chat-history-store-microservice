# Test Documentation

This document provides comprehensive information about the test suite for the Chat Application Message Store.

## Test Structure

The test suite is organized into three main categories:

### 1. Unit Tests (`src/**/*.spec.ts`)
- **Purpose**: Test individual components in isolation
- **Location**: Co-located with source files
- **Coverage**: Controllers, Use Cases, Repositories, DTOs, Guards, Services

### 2. Integration Tests (`test/integration/*.spec.ts`)
- **Purpose**: Test API endpoints with real database interactions
- **Location**: `test/integration/` directory
- **Coverage**: HTTP endpoints, database operations, authentication

### 3. End-to-End Tests (`test/e2e/*.spec.ts`)
- **Purpose**: Test complete user workflows
- **Location**: `test/e2e/` directory
- **Coverage**: Full application scenarios, cross-module interactions

## Test Files Overview

### Unit Tests

#### Sessions Module
- `src/sessions/__tests__/sessions.controller.spec.ts` - Controller unit tests
- `src/sessions/__tests__/sessions.usecases.spec.ts` - Use case unit tests
- `src/sessions/__tests__/prisma-sessions.repository.spec.ts` - Repository unit tests
- `src/sessions/__tests__/dto.spec.ts` - DTO validation tests

#### Messages Module
- `src/messages/__tests__/messages.controller.spec.ts` - Controller unit tests
- `src/messages/__tests__/messages.usecases.spec.ts` - Use case unit tests
- `src/messages/__tests__/prisma-messages.repository.spec.ts` - Repository unit tests
- `src/messages/__tests__/dto.spec.ts` - DTO validation tests

#### Common Module
- `src/common/__tests__/api-key.guard.spec.ts` - API key guard tests
- `src/common/__tests__/rate-limit.guard.spec.ts` - Rate limiting tests

#### Configuration
- `src/config/__tests__/validate.spec.ts` - Configuration validation tests

#### Application
- `src/__tests__/health.controller.spec.ts` - Health check tests

### Integration Tests
- `test/integration/sessions.integration.spec.ts` - Sessions API integration tests
- `test/integration/messages.integration.spec.ts` - Messages API integration tests

### End-to-End Tests
- `test/e2e/app.e2e-spec.ts` - Complete workflow tests

### Test Utilities
- `test/utils/test-database.ts` - Database test utilities
- `test/utils/test-helpers.ts` - HTTP request helpers
- `test/setup.ts` - Global test setup

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Types
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# End-to-end tests only
npm run test:e2e

# All test types sequentially
npm run test:all
```

### Development
```bash
# Watch mode for development
npm run test:watch

# Coverage report
npm run test:cov
```

## Test Coverage

The test suite covers:

### Controllers
- ✅ HTTP request/response handling
- ✅ Parameter validation
- ✅ Error handling
- ✅ Authentication/authorization

### Use Cases
- ✅ Business logic execution
- ✅ Repository interaction
- ✅ Input validation
- ✅ Error propagation

### Repositories
- ✅ Database operations
- ✅ Query building
- ✅ Transaction handling
- ✅ Error handling

### DTOs
- ✅ Input validation
- ✅ Type checking
- ✅ Required field validation
- ✅ Format validation

### Guards
- ✅ Authentication logic
- ✅ Rate limiting
- ✅ Authorization checks

### Configuration
- ✅ Environment variable validation
- ✅ Type conversion
- ✅ Required field validation

### Integration
- ✅ API endpoint functionality
- ✅ Database integration
- ✅ Authentication flow
- ✅ Error responses

### End-to-End
- ✅ Complete user workflows
- ✅ Multi-user scenarios
- ✅ Pagination
- ✅ Rate limiting
- ✅ Data persistence

## Test Data Management

### Database Cleanup
- Tests automatically clean up data before and after execution
- Uses `TestDatabase` utility for consistent cleanup
- Ensures test isolation

### Test Data Creation
- Uses `TestHelpers` utility for consistent API calls
- Creates realistic test data
- Supports both individual and bulk operations

## Authentication in Tests

### API Key Testing
- Tests both valid and invalid API keys
- Tests missing API key scenarios
- Tests API key configuration

### Rate Limiting Testing
- Tests rate limit enforcement
- Tests rate limit reset
- Tests per-user rate limiting

## Database Testing

### Test Database
- Uses same Prisma schema as production
- Automatic cleanup between tests
- Transaction support

### Data Isolation
- Each test runs with clean database state
- No data leakage between tests
- Consistent test environment

## Performance Testing

### Rate Limiting
- Tests 60 requests per minute limit
- Tests rate limit enforcement
- Tests rate limit reset behavior

### Pagination
- Tests large dataset pagination
- Tests page boundary conditions
- Tests total count accuracy

## Error Handling Testing

### Validation Errors
- Tests invalid input data
- Tests missing required fields
- Tests type validation

### Business Logic Errors
- Tests unauthorized access
- Tests resource not found
- Tests constraint violations

### System Errors
- Tests database connection issues
- Tests configuration errors
- Tests unexpected errors

## Continuous Integration

### Test Scripts
- `npm test` - Run all tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:e2e` - End-to-end tests only
- `npm run test:cov` - Coverage report

### Coverage Requirements
- Minimum 80% code coverage
- All critical paths covered
- All error conditions tested

## Best Practices

### Test Organization
- Co-locate unit tests with source files
- Group integration tests by feature
- Use descriptive test names

### Test Data
- Use realistic test data
- Avoid hardcoded values
- Use factories for complex data

### Assertions
- Test both positive and negative cases
- Verify data changes
- Check error messages

### Test Isolation
- Clean up after each test
- Don't depend on test execution order
- Use fresh data for each test

## Debugging Tests

### Running Specific Tests
```bash
# Run specific test file
npm test -- sessions.controller.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create session"
```

### Debug Mode
```bash
# Run with debug output
npm test -- --verbose

# Run single test file with debug
npm test -- sessions.controller.spec.ts --verbose
```

## Test Environment Setup

### Prerequisites
- Node.js 20.19.0
- npm 10.8.2
- PostgreSQL database
- Prisma configured

### Environment Variables
Tests use the same environment variables as the application:
- `DATABASE_URL` - PostgreSQL connection string
- `API_KEY` - API authentication key
- `PORT` - Application port
- Other configuration variables

### Database Setup
- Tests use the same database schema
- Automatic migrations during test setup
- Clean database state for each test

## Contributing

### Adding New Tests
1. Follow existing test patterns
2. Use descriptive test names
3. Include both positive and negative cases
4. Clean up test data
5. Update this documentation

### Test Naming Convention
- Use descriptive names that explain the test scenario
- Include expected behavior in the name
- Group related tests with `describe` blocks

### Example:
```typescript
describe('CreateSessionUC', () => {
  it('should create a session with title', async () => {
    // test implementation
  });

  it('should create a session without title', async () => {
    // test implementation
  });

  it('should fail with invalid userId', async () => {
    // test implementation
  });
});
```

This comprehensive test suite ensures the reliability, security, and functionality of the Chat Application Message Store.
