// build-extension.js - Custom build script for browser extension files
import { build } from 'vite';
import { resolve } from 'path';

const extensionEntries = [
  { name: 'content', path: 'js/content/index.js' },
  { name: 'background', path: 'js/background.js' },
  { name: 'auth-content', path: 'js/auth/auth-content.js' },
  { name: 'demofliocloud', path: 'js/demofliocloud.js' }
];

async function buildExtensionFiles() {
  for (const entry of extensionEntries) {
    console.log(`Building ${entry.name}...`);
    
    try {
      await build({
        configFile: false,
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(process.cwd(), entry.path),
            name: `${entry.name}Bundle`,
            fileName: () => `${entry.name}-bundle.js`,
            formats: ['iife']
          },
          rollupOptions: {
            output: {
              extend: true,
              globals: {
                chrome: 'chrome'
              }
            },
            external: ['chrome']
          },
          minify: 'terser'
        },
        css: {
          postcss: './postcss.config.js'
        }
      });
      
      console.log(`✓ Built ${entry.name}-bundle.js`);
    } catch (error) {
      console.error(`✗ Failed to build ${entry.name}:`, error);
      process.exit(1);
    }
  }
}

buildExtensionFiles().catch(console.error);
