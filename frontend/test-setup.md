# Test Setup Instructions

## React 19 Compatibility

This project uses React 19, which may cause peer dependency warnings with some testing libraries. This is expected and safe to ignore.

## Installation

```bash
# Install dependencies with legacy peer deps to resolve React 19 warnings
npm install --legacy-peer-deps
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

## Test Structure

- **Components**: `src/components/__tests__/`
- **Hooks**: `src/hooks/__tests__/`
- **Utils**: `src/utils/__tests__/`
- **Services**: `src/services/__tests__/`
- **Constants**: `src/constants/__tests__/`

## Expected Coverage

- **Target**: 80%+ coverage
- **Components**: All user interactions and edge cases
- **Hooks**: Custom hook behavior and error handling
- **Utils**: Utility functions with various inputs
- **API**: Service layer with mocked responses

## Troubleshooting

### Peer Dependency Warnings

If you see warnings like:
```
@testing-library/react-hooks requires react@^16.8.0 || ^17.0.0
```

This is expected with React 19. The libraries work correctly but haven't updated their peer dependency declarations yet.

### Test Failures

1. **Mock Issues**: Ensure all mocks are properly set up in `src/test/`
2. **Async Tests**: Use `waitFor` for async operations
3. **Component Tests**: Use the custom render function from `src/test/utils.tsx`

### MSW (Mock Service Worker)

The tests use MSW to mock API calls. If you see network-related test failures:

1. Check that MSW handlers are properly configured
2. Ensure the server is started in test setup
3. Verify API endpoints match the mock handlers
