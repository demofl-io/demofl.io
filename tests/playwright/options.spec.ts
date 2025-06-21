import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Extension Options Page', () => {
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

  test('should load options page with configuration interface', async () => {
    const optionsUrl = `chrome-extension://${extensionId}/html/config.html`;
    const page = await context.newPage();
    await page.goto(optionsUrl);

    // Check if the configuration title is present
    await expect(page.locator('h1')).toHaveText('Configuration');

    // Check if theme toggle button is present
    await expect(page.locator('#theme-toggle')).toBeVisible();

    // Check if tabs are present
    await expect(page.locator('.tabs')).toBeVisible();
    await expect(page.locator('[data-tab="logos"]')).toBeVisible();
    await expect(page.locator('[data-tab="personas"]')).toBeVisible();

    // Check if logos tab is active by default
    await expect(page.locator('[data-tab="logos"]')).toHaveClass(/tab-active/);

    await page.close();
  });

  test('should switch between tabs correctly', async () => {
    const optionsUrl = `chrome-extension://${extensionId}/html/config.html`;
    const page = await context.newPage();
    await page.goto(optionsUrl);

    const logosTab = page.locator('[data-tab="logos"]');
    const personasTab = page.locator('[data-tab="personas"]');

    // Initially, logos tab should be active
    await expect(logosTab).toHaveClass(/tab-active/);

    // Click on personas tab
    await personasTab.click();

    // Wait for tab switch
    await page.waitForTimeout(100);

    // Now personas tab should be active
    await expect(personasTab).toHaveClass(/tab-active/);

    // Switch back to logos tab
    await logosTab.click();
    await page.waitForTimeout(100);

    await expect(logosTab).toHaveClass(/tab-active/);

    await page.close();
  });

  test('should handle theme toggle on options page', async () => {
    const optionsUrl = `chrome-extension://${extensionId}/html/config.html`;
    const page = await context.newPage();
    await page.goto(optionsUrl);

    const html = page.locator('html');
    const themeToggle = page.locator('#theme-toggle');

    // Check initial theme
    await expect(html).toHaveAttribute('data-theme', 'business');

    // Click theme toggle
    await themeToggle.click();

    // Wait for theme change
    await page.waitForTimeout(100);

    // Take screenshot after theme change
    await page.screenshot({ path: 'tests/playwright/screenshots/options-theme-toggle.png' });

    await page.close();
  });

  test('should take visual screenshot of options page', async () => {
    const optionsUrl = `chrome-extension://${extensionId}/html/config.html`;
    const page = await context.newPage();
    await page.goto(optionsUrl);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({ 
      path: 'tests/playwright/screenshots/options-full.png',
      fullPage: true 
    });

    await page.close();
  });
});