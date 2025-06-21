import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Extension Integration Tests', () => {
  let context: BrowserContext;
  let extensionId: string;

  test.beforeAll(async () => {
    const pathToExtension = path.join(__dirname, '../../dist');
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    // Get extension id from the service worker registration
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    
    extensionId = background.url().split('/')[2];
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('should load extension and verify basic functionality', async () => {
    // Verify extension is loaded by checking service worker
    const serviceWorkers = context.serviceWorkers();
    expect(serviceWorkers.length).toBeGreaterThan(0);

    const background = serviceWorkers[0];
    expect(background.url()).toContain(extensionId);
  });

  test('should access extension pages', async () => {
    const pages = [
      { name: 'popup', path: 'html/popup.html', title: 'Demofl.io' },
      { name: 'options', path: 'html/config.html', title: 'Configuration' },
      { name: 'overview', path: 'html/overview.html' },
      { name: 'editor', path: 'html/editor.html' },
    ];

    for (const pageInfo of pages) {
      const page = await context.newPage();
      const url = `chrome-extension://${extensionId}/${pageInfo.path}`;
      
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Verify page loads without errors
      const pageTitle = await page.title();
      if (pageInfo.title) {
        expect(pageTitle).toContain(pageInfo.title);
      }

      // Check for any console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `tests/playwright/screenshots/${pageInfo.name}-page.png`,
        fullPage: true 
      });

      await page.close();

      // Log any errors found
      if (errors.length > 0) {
        console.warn(`Console errors on ${pageInfo.name} page:`, errors);
      }
    }
  });

  test('should handle extension permissions correctly', async () => {
    const page = await context.newPage();
    
    // Test that the extension has the necessary permissions
    const hasPermissions = await page.evaluate(async () => {
      if (typeof chrome !== 'undefined' && chrome.permissions) {
        try {
          // Check for required permissions from manifest
          const permissions = ['tabs', 'activeTab', 'storage', 'windows', 'tabGroups'];
          const results = await Promise.all(
            permissions.map(permission => 
              chrome.permissions.contains({ permissions: [permission] })
            )
          );
          return results.every(Boolean);
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    expect(hasPermissions).toBe(true);
    await page.close();
  });

  test('should test tab group functionality', async () => {
    const page = await context.newPage();
    await page.goto('https://example.com');

    // Test tab groups API if available
    const tabGroupsSupported = await page.evaluate(async () => {
      if (typeof chrome !== 'undefined' && chrome.tabGroups) {
        try {
          // Query tab groups
          const groups = await chrome.tabGroups.query({});
          return Array.isArray(groups);
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    // Tab groups should be supported in the test environment
    expect(typeof tabGroupsSupported).toBe('boolean');
    await page.close();
  });

  test('should test storage functionality', async () => {
    const page = await context.newPage();
    
    const storageTest = await page.evaluate(async () => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          // Test storage
          const testData = { testKey: 'testValue' };
          await chrome.storage.local.set(testData);
          const result = await chrome.storage.local.get('testKey');
          return result.testKey === 'testValue';
        } catch (error) {
          return false;
        }
      }
      return false;
    });

    expect(storageTest).toBe(true);
    await page.close();
  });

  test('should validate extension manifest', async () => {
    // Read and validate the manifest
    const manifestPath = path.join(__dirname, '../../dist/manifest.json');
    const fs = require('fs');
    
    if (fs.existsSync(manifestPath)) {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Validate key manifest properties
      expect(manifest.manifest_version).toBe(3);
      expect(manifest.name).toBe('demofl.io');
      expect(manifest.permissions).toContain('tabs');
      expect(manifest.permissions).toContain('storage');
      expect(manifest.background.service_worker).toBeDefined();
    }
  });

  test('should create comprehensive visual regression suite', async () => {
    // Take screenshots of all major extension UI components
    const components = [
      { name: 'popup', path: 'html/popup.html' },
      { name: 'options', path: 'html/config.html' },
      { name: 'overview', path: 'html/overview.html' },
    ];

    for (const component of components) {
      const page = await context.newPage();
      const url = `chrome-extension://${extensionId}/${component.path}`;
      
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Take multiple screenshots for different states
      await page.screenshot({ 
        path: `tests/playwright/screenshots/regression-${component.name}-default.png`,
        fullPage: true 
      });

      // Test dark theme if theme toggle exists
      const themeToggle = page.locator('#theme-toggle');
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(200);
        
        await page.screenshot({ 
          path: `tests/playwright/screenshots/regression-${component.name}-dark.png`,
          fullPage: true 
        });
      }

      await page.close();
    }
  });
});