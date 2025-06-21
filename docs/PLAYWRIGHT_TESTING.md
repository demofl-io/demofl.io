# Playwright Visual Testing Guide

This document describes the visual testing infrastructure for the Demofl.io Chrome extension using Playwright.

## Overview

The extension uses [Playwright](https://playwright.dev/) for end-to-end visual testing of the Chrome extension in a real browser environment. This complements the existing Vitest unit tests by providing visual regression testing and browser-based integration testing.

## Test Structure

```
tests/playwright/
├── popup.spec.ts              # Extension popup UI tests
├── options.spec.ts            # Options/configuration page tests
├── content-script.spec.ts     # Content script injection tests
├── integration.spec.ts        # Full extension integration tests
└── screenshots/              # Visual regression screenshots
    ├── popup-full.png
    ├── options-full.png
    └── regression-*.png
```

## Running Playwright Tests

### Prerequisites

1. Build the extension first:
```bash
npm run build
```

2. Install Playwright browsers (if not already installed):
```bash
npx playwright install chromium
```

### Test Commands

```bash
# Run all Playwright tests
npm run test:e2e

# Run tests with UI interface
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug
```

## Test Categories

### 1. Popup Tests (`popup.spec.ts`)
Tests the extension popup interface:
- UI layout and components
- Theme toggling functionality
- Button interactions
- Visual regression screenshots

### 2. Options Page Tests (`options.spec.ts`)
Tests the extension options/configuration page:
- Tab navigation
- Theme switching
- Configuration interface
- Visual state verification

### 3. Content Script Tests (`content-script.spec.ts`)
Tests content script injection and functionality:
- Script injection on web pages
- Message passing between content and background scripts
- Authentication callback handling
- Demo flow integration

### 4. Integration Tests (`integration.spec.ts`)
Comprehensive extension testing:
- Extension loading and initialization
- Permissions verification
- Chrome API functionality
- Storage operations
- Visual regression suite

## Visual Testing Features

### Screenshot Comparison
The tests automatically capture screenshots for:
- **Regression Testing**: Comparing UI changes over time
- **Theme Variations**: Light and dark theme states
- **Component States**: Different UI states and interactions

### Browser Context
Each test suite runs in a dedicated browser context with:
- Extension pre-loaded
- Proper permissions configured
- Isolated storage and state

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:
- **Chromium Browser**: Configured for extension testing
- **Extension Loading**: Automatic extension loading from `dist/` directory
- **Screenshot Storage**: Organized screenshot capture
- **Test Reporting**: HTML reports with visual comparisons

## Best Practices

### Writing New Tests

1. **Use Page Object Model**: Create reusable page objects for complex UI interactions
2. **Wait for Elements**: Always wait for elements to be visible before interacting
3. **Take Screenshots**: Capture screenshots for visual verification
4. **Test Error States**: Include tests for error scenarios and edge cases

### Visual Regression Testing

1. **Consistent Screenshots**: Take screenshots at the same viewport size
2. **Stable Elements**: Wait for animations and loading states to complete
3. **Cross-browser Testing**: Consider testing on different browsers if needed

### Performance Considerations

1. **Parallel Execution**: Tests run in parallel for faster execution
2. **Context Reuse**: Reuse browser contexts when possible
3. **Cleanup**: Properly close pages and contexts after tests

## Debugging

### Common Issues

1. **Extension Not Loading**: Ensure `npm run build` was run successfully
2. **Timing Issues**: Add appropriate waits for dynamic content
3. **Screenshot Differences**: Check for animation states or loading indicators

### Debug Commands

```bash
# Run specific test file
npx playwright test popup.spec.ts

# Run tests with debug output
npx playwright test --debug popup.spec.ts

# Generate test report
npx playwright show-report
```

## CI/CD Integration

The Playwright tests are configured for CI/CD with:
- **Headless Mode**: Tests run without GUI in CI
- **Retry Logic**: Automatic retries for flaky tests
- **Artifact Collection**: Screenshots and reports saved as artifacts

## Extension-Specific Considerations

### Chrome Extension APIs
Tests mock or verify Chrome extension APIs:
- `chrome.tabs` - Tab management
- `chrome.storage` - Data persistence
- `chrome.runtime` - Message passing
- `chrome.permissions` - Permission checking

### Security Context
Extension tests run in a secure context with:
- Proper extension permissions
- Content Security Policy compliance
- Isolated storage and state

## Examples

### Testing Button Interactions
```typescript
test('should handle button click', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/html/popup.html`);
  
  const button = page.locator('#my-button');
  await button.click();
  
  await expect(page.locator('#result')).toHaveText('Success');
});
```

### Visual Regression Testing
```typescript
test('should match visual snapshot', async () => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/html/popup.html`);
  
  await page.screenshot({ 
    path: 'tests/playwright/screenshots/popup-state.png',
    fullPage: true 
  });
});
```

## Troubleshooting

### Extension Loading Issues
If the extension fails to load:
1. Verify `dist/` folder exists and contains built files
2. Check `manifest.json` is valid
3. Ensure all required permissions are granted

### Test Flakiness
To reduce test flakiness:
1. Use proper waits (`waitForLoadState`, `waitForSelector`)
2. Avoid hard-coded timeouts
3. Wait for network idle state before screenshots

### Screenshots Not Matching
If visual regression fails:
1. Review screenshot differences in test report
2. Update baseline screenshots if changes are intentional
3. Check for browser/OS differences in rendering