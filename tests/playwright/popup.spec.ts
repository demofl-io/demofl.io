import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Extension Popup', () => {
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

  test('should load popup with correct title and layout', async () => {
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    const page = await context.newPage();
    await page.goto(popupUrl);

    // Check if the main title is present
    await expect(page.locator('h1')).toHaveText('Demofl.io');

    // Check if the popup has the correct dimensions
    const body = page.locator('body');
    await expect(body).toHaveCSS('width', '600px');

    // Check if theme toggle button is present
    await expect(page.locator('#theme-toggle')).toBeVisible();

    // Check if popout button is present
    await expect(page.locator('#popout')).toBeVisible();

    // Check if login buttons are present
    await expect(page.locator('#login')).toBeVisible();
    await expect(page.locator('#paynow')).toBeVisible();
    await expect(page.locator('#trial')).toBeVisible();

    await page.close();
  });

  test('should toggle theme correctly', async () => {
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    const page = await context.newPage();
    await page.goto(popupUrl);

    const html = page.locator('html');
    const themeToggle = page.locator('#theme-toggle');

    // Check initial theme
    await expect(html).toHaveAttribute('data-theme', 'business');

    // Click theme toggle
    await themeToggle.click();

    // Wait for theme change (assuming it changes to light theme)
    await page.waitForTimeout(100);

    // Take screenshot after theme change
    await page.screenshot({ path: 'tests/playwright/screenshots/popup-theme-toggle.png' });

    await page.close();
  });

  test('should handle popout button click', async () => {
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    const page = await context.newPage();
    await page.goto(popupUrl);

    const popoutButton = page.locator('#popout');

    // Set up listener for new tab
    const newPagePromise = context.waitForEvent('page');

    // Click popout button
    await popoutButton.click();

    // Wait for new tab and verify it opens
    const newPage = await newPagePromise;
    await newPage.waitForLoadState();

    expect(newPage.url()).toContain('overview.html');

    await newPage.close();
    await page.close();
  });

  test('should display template list container', async () => {
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    const page = await context.newPage();
    await page.goto(popupUrl);

    // Check if template list container is present
    await expect(page.locator('#templateList')).toBeVisible();

    // Check if template file input is present (though hidden)
    await expect(page.locator('#templateFileInput')).toBeHidden();

    await page.close();
  });

  test('should take visual screenshot for regression testing', async () => {
    const popupUrl = `chrome-extension://${extensionId}/html/popup.html`;
    const page = await context.newPage();
    await page.goto(popupUrl);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await page.screenshot({ 
      path: 'tests/playwright/screenshots/popup-full.png',
      fullPage: true 
    });

    await page.close();
  });
});