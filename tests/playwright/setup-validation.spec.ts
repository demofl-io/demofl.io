import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Extension Test Setup Validation', () => {
  test('should have built extension files', () => {
    const distPath = path.join(__dirname, '../../dist');
    const manifestPath = path.join(distPath, 'manifest.json');
    
    expect(fs.existsSync(distPath)).toBe(true);
    expect(fs.existsSync(manifestPath)).toBe(true);
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('demofl.io');
  });

  test('should have required extension bundles', () => {
    const distPath = path.join(__dirname, '../../dist');
    const requiredFiles = [
      'background-bundle.js',
      'content-bundle.js',
      'popup-bundle.js',
      'config-bundle.js',
      'overview-bundle.js',
      'output.css'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(distPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('should have proper HTML files structure', () => {
    const htmlPath = path.join(__dirname, '../../dist/html');
    const requiredHtmlFiles = [
      'popup.html',
      'config.html',
      'overview.html',
      'editor.html'
    ];

    for (const file of requiredHtmlFiles) {
      const filePath = path.join(htmlPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  test('should validate extension permissions', () => {
    const manifestPath = path.join(__dirname, '../../dist/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const requiredPermissions = ['tabs', 'activeTab', 'storage', 'windows', 'tabGroups'];
    
    for (const permission of requiredPermissions) {
      expect(manifest.permissions).toContain(permission);
    }
  });

  test('should have proper content scripts configuration', () => {
    const manifestPath = path.join(__dirname, '../../dist/manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    expect(manifest.content_scripts).toBeDefined();
    expect(Array.isArray(manifest.content_scripts)).toBe(true);
    expect(manifest.content_scripts.length).toBeGreaterThan(0);
    
    // Check main content script
    const mainContentScript = manifest.content_scripts.find(
      (cs: any) => cs.js.includes('content-bundle.js')
    );
    expect(mainContentScript).toBeDefined();
    expect(mainContentScript.matches).toContain('https://*/*');
  });
});