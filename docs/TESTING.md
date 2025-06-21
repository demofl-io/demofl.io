# Testing Guide

This document describes the testing infrastructure for the Demofl.io Chrome extension.

## Overview

The extension uses [Vitest](https://vitest.dev/) as the testing framework with comprehensive Chrome API mocking to ensure reliable testing of browser extension functionality.

## Test Structure

```
tests/
├── setup.ts                 # Test configuration and Chrome API mocks
├── auth-service.test.ts      # Authentication service tests
├── background.test.ts        # Background script functionality tests
├── chrome-apis.test.ts       # Chrome extension API tests
├── content-script.test.ts    # Content script tests
├── integration.test.ts       # Integration and validation tests
├── overview-loader.test.ts   # Overview page loader tests
├── parser.test.ts            # Demo flow parser tests
└── types.test.ts            # TypeScript type definition tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Categories

### 1. Background Script Tests (`background.test.ts`)
Tests the service worker functionality including:
- Message handling (getTabId, AUTH_SUCCESS, EXTENSION_RUNDEMO)
- Tab management and creation
- Service worker keep-alive functionality
- Error handling

### 2. Authentication Service Tests (`auth-service.test.ts`)
Tests OAuth/OIDC authentication flows:
- Code challenge generation (PKCE)
- Client configuration fetching
- Login URL generation
- Token exchange and storage
- Authentication state management
- Sign out functionality

### 3. Parser Tests (`parser.test.ts`)
Tests demo flow processing:
- JSON file parsing (builtin and user templates)
- Tab creation for demo steps
- Incognito window handling
- Storage operations
- Step validation

### 4. Chrome APIs Tests (`chrome-apis.test.ts`)
Tests Chrome extension API interactions:
- Storage operations (local storage)
- Runtime messaging
- Tab management (create, remove, query, sendMessage)
- Window management
- Tab groups
- Event listeners
- Error handling

### 5. Types Tests (`types.test.ts`)
Validates TypeScript type definitions:
- DemoFlowTemplate structure
- Extension message formats
- Persona and step definitions
- Theme configuration
- User template structure

### 6. Integration Tests (`integration.test.ts`)
Tests overall functionality:
- Manifest validation
- Message handling workflows
- Data validation (URLs, colors, personas)
- Template structure validation

### 7. Content Script Tests (`content-script.test.ts`)
Tests content script functionality:
- DOM manipulation
- Event handling
- CSS injection
- Element queries

### 8. Overview Loader Tests (`overview-loader.test.ts`)
Tests overview page functionality:
- Template loading from storage
- URL parameter handling
- DOM manipulation
- Error handling

## Chrome API Mocking

The test setup includes comprehensive Chrome API mocks in `tests/setup.ts`:

```typescript
// Example of mocked Chrome APIs
global.chrome = {
  runtime: {
    getURL: vi.fn(),
    sendMessage: vi.fn(),
    onMessage: { addListener: vi.fn() }
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn()
    }
  },
  tabs: {
    create: vi.fn(),
    remove: vi.fn(),
    sendMessage: vi.fn()
  }
  // ... more APIs
}
```

## Best Practices

### 1. Mock Chrome APIs
Always mock Chrome APIs rather than relying on real browser functionality:

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  global.chrome.storage.local.get.mockResolvedValue({ data: 'test' })
})
```

### 2. Test Business Logic
Focus on testing the core business logic rather than implementation details:

```typescript
it('should handle authentication success', async () => {
  const result = await authService.isAuthenticated()
  expect(result).toBe(true)
})
```

### 3. Use Descriptive Test Names
Test names should clearly describe what they're testing:

```typescript
it('should create incognito window for incognito steps', async () => {
  // Test implementation
})
```

### 4. Test Error Scenarios
Always include tests for error conditions:

```typescript
it('should handle storage errors gracefully', async () => {
  global.chrome.storage.local.get.mockRejectedValueOnce(new Error('Storage error'))
  // Test error handling
})
```

### 5. Clean Up After Tests
Use `beforeEach` and `afterEach` to ensure clean test state:

```typescript
beforeEach(() => {
  vi.clearAllMocks()
})
```

## Coverage

The test suite provides comprehensive coverage of:
- ✅ Background script message handling
- ✅ Authentication flows
- ✅ Demo flow parsing
- ✅ Chrome API interactions
- ✅ Type definitions
- ✅ Error handling
- ✅ Integration scenarios

## Adding New Tests

When adding new functionality:

1. **Create tests first** (TDD approach)
2. **Mock external dependencies** (Chrome APIs, network requests)
3. **Test both success and failure scenarios**
4. **Use descriptive test names**
5. **Keep tests focused and isolated**

Example:

```typescript
describe('New Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup mocks
  })

  it('should handle normal operation', () => {
    // Test normal case
  })

  it('should handle error conditions', () => {
    // Test error case
  })
})
```

## Debugging Tests

To debug failing tests:

1. Use `console.log` in tests (removed in CI)
2. Run specific test files: `npm test -- background.test.ts`
3. Use the Vitest UI: `npm run test:ui`
4. Check mock call arguments: `expect(mockFn).toHaveBeenCalledWith(...)`

## CI/CD Integration

Tests are designed to run in CI environments without requiring actual browser instances. All Chrome APIs are mocked, making tests fast and reliable.