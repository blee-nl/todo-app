# Todo App E2E Testing Infrastructure

This directory contains a comprehensive Playwright testing infrastructure for the Todo application, designed to provide robust, maintainable, and scalable end-to-end testing.

## 🏗️ Architecture Overview

### Test Structure
```
tests/e2e/
├── fixtures/           # Custom Playwright fixtures
├── page-objects/       # Page Object Model classes
├── setup/             # Test setup and authentication
├── utils/             # Testing utilities and helpers
├── *.spec.ts          # Test specification files
├── global-setup.ts    # Global test setup
└── global-teardown.ts # Global test cleanup
```

### Key Features

- **🎯 Page Object Model**: Clean separation of test logic from page interactions
- **🔧 Custom Fixtures**: Reusable test components for database, React Query, and page objects
- **📊 Database Integration**: Direct MongoDB integration for test data setup and verification
- **⚡ React Query Handling**: Smart waiting strategies for React Query cache operations
- **🌐 Multi-Browser Support**: Cross-browser testing (Chrome, Firefox, Safari, Edge)
- **📱 Mobile Testing**: Mobile viewport and touch interaction testing
- **🔄 State Management**: Comprehensive testing of the 4-state todo workflow
- **🔍 Search & Filter**: Advanced search and filtering functionality testing
- **🚨 Error Scenarios**: Network failure and error state testing
- **📈 Performance Testing**: Load testing with large datasets

## 🚀 Quick Start

### Prerequisites
1. MongoDB running on `localhost:27017`
2. Backend server available on `localhost:5001`
3. Frontend development server on `localhost:5173`

### Installation
```bash
# Install dependencies (MongoDB driver is included)
cd frontend
pnpm install

# Install Playwright browsers
pnpm exec playwright install
```

### Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI mode
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# Run specific browser tests
pnpm test:e2e:chrome
pnpm test:e2e:firefox
pnpm test:e2e:safari

# Run mobile tests
pnpm test:e2e:mobile

# Run critical/smoke tests only
pnpm test:e2e:critical
pnpm test:e2e:smoke

# View test report
pnpm test:e2e:report
```

## 📋 Test Categories

### 🔴 Critical Tests (`@critical`)
- Core todo lifecycle (pending → active → completed/failed)
- State transitions and data persistence
- Essential user workflows

### 🟡 Smoke Tests (`@smoke`)
- Basic application functionality
- Quick validation of core features
- Pre-deployment verification

### 🔵 Integration Tests (`@integration`)
- Multi-component interactions
- Database and API integration
- React Query cache synchronization

### 🟢 Performance Tests (`@performance`)
- Large dataset handling
- Response time validation
- Search/filter performance

### 🟠 Edge Cases (`@edge-cases`)
- Error scenarios
- Special character handling
- Empty states and boundary conditions

## 🛠️ Test Data Management

### Test Data Service
The `TestDataService` provides pre-configured test data for various scenarios:

```typescript
// Create simple test todos
const todos = testDataService.createTestSuite();

// Create performance test data
const largeTodoSet = testDataService.createPerformanceTestData(100);

// Seed database with specific scenarios
await testDataService.seedComprehensiveScenario();
```

### Database Utilities
Direct database access for setup and verification:

```typescript
// Clean database
await dbUtils.clearAllTodos();

// Create test data
const todo = await dbUtils.createTodo({
  text: 'Test Todo',
  state: 'pending',
  type: 'one-time'
});

// Wait for specific state
await dbUtils.waitForTodoInState(todoId, 'completed');
```

## 🎭 Page Object Model

### Base Page Class
All page objects extend `BasePage` which provides:
- Smart waiting strategies
- React Query synchronization
- Network request handling
- Screenshot capture
- Error handling

### Todo Page Object
The `TodoPage` class provides high-level operations:

```typescript
// Create todos with full configuration
await todoPage.createTodo({
  text: 'New Task',
  type: 'one-time',
  dueAt: new Date(),
  notification: { enabled: true, reminderMinutes: 30 }
});

// Perform state transitions
await todoPage.activateTodo('Task Name');
await todoPage.completeTodo('Task Name');
await todoPage.failTodo('Task Name');

// Search and filter
await todoPage.searchTodos('search term');
await todoPage.switchToTab('active');
```

## ⚡ React Query Integration

### Automatic Cache Handling
Tests automatically wait for React Query operations:

```typescript
// Wait for all queries to settle
await reactQueryUtils.waitForQueriesToSettle();

// Wait for specific query
await reactQueryUtils.waitForQueryToSettle(['todos']);

// Handle cache invalidation
await reactQueryUtils.invalidateAllQueries();
```

### Network Simulation
Test network conditions and error scenarios:

```typescript
// Simulate offline mode
await reactQueryUtils.goOffline();

// Mock API errors
await reactQueryUtils.mockAPIError(/\/api\/todos/, 500);

// Test slow networks
await reactQueryUtils.setSlowNetwork();
```

## 🗂️ Test Organization

### Naming Conventions
- **Spec files**: `feature-name.spec.ts`
- **Test descriptions**: Clear, action-oriented descriptions
- **Test steps**: Use `test.step()` for detailed reporting

### Test Tags
Use tags for test categorization:
- `@critical` - Must pass for deployment
- `@smoke` - Quick validation tests
- `@integration` - Multi-component tests
- `@performance` - Performance validation
- `@edge-cases` - Boundary condition tests

### Example Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.navigate();
  });

  test('should handle specific workflow @critical', async ({
    todoPage,
    testDataService,
    reactQueryUtils
  }) => {
    await test.step('Setup test data', async () => {
      // Test setup
    });

    await test.step('Perform action', async () => {
      // Test execution
    });

    await test.step('Verify results', async () => {
      // Assertions
    });
  });
});
```

## 🔧 Configuration

### Environment Variables
- `BASE_URL`: Frontend application URL (default: http://localhost:5173)
- `MONGO_URI`: MongoDB connection string (default: mongodb://localhost:27017/todo-app-test)

### Playwright Configuration
- **Parallel execution**: Optimized for fast feedback
- **Retry logic**: Automatic retry on transient failures
- **Reporting**: HTML, JUnit, and JSON reports
- **Artifacts**: Screenshots, videos, and traces on failure

## 🚨 Debugging

### Debug Mode
```bash
# Step through tests with debugger
pnpm test:e2e:debug

# Run with headed browser
pnpm test:e2e:headed
```

### Trace Viewer
```bash
# View trace for failed tests
pnpm test:e2e:report
```

### Console Logging
```typescript
// Debug React Query state
await reactQueryUtils.debugQueryStates();

// Take manual screenshots
await todoPage.takeScreenshot('debug-screenshot');
```

## 📊 CI/CD Integration

### GitHub Actions
The `.github/workflows/e2e-tests.yml` workflow:
- Runs on push/PR to master/dev
- Sets up MongoDB service
- Installs dependencies and browsers
- Starts backend and frontend servers
- Executes all E2E tests
- Uploads test artifacts

### Performance Metrics
- Test execution time monitoring
- Browser performance validation
- Network request optimization
- Memory usage tracking

## 🔄 Maintenance

### Updating Tests
1. Keep page objects in sync with UI changes
2. Update selectors to use `data-testid` attributes
3. Maintain test data factories for new features
4. Add new test scenarios for feature additions

### Best Practices
- Use stable selectors (`data-testid` preferred)
- Keep tests independent and isolated
- Use descriptive test and step names
- Leverage fixtures for common operations
- Handle async operations properly
- Clean up test data after each test

## 📈 Metrics and Reporting

### Test Coverage
- State transition coverage
- User workflow coverage
- Error scenario coverage
- Cross-browser compatibility

### Performance Benchmarks
- Test execution time: < 10 minutes total
- Individual test time: < 2 minutes
- Search performance: < 2 seconds with 100+ todos
- Page load time: < 5 seconds

## 🤝 Contributing

When adding new tests:
1. Follow the existing page object pattern
2. Use appropriate test tags
3. Include both happy path and error scenarios
4. Update this README if adding new patterns
5. Ensure tests are deterministic and stable

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Best Practices](https://playwright.dev/docs/pom)
- [React Query Testing Guide](https://tanstack.com/query/latest/docs/react/guides/testing)
- [MongoDB Testing Patterns](https://www.mongodb.com/docs/manual/reference/method/)

---

This E2E testing infrastructure provides a solid foundation for maintaining high-quality, reliable tests that grow with your application. The combination of Page Object Model, custom fixtures, and comprehensive utilities ensures your tests remain maintainable and valuable over time.