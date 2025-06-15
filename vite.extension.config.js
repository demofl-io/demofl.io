import { defineConfig } from 'vite';
import { resolve } from 'path';

const entryMappings = {
  'content': 'js/content/index.js',
  'background': 'js/background.js', 
  'auth-content': 'js/auth/auth-content.js',
  'demofliocloud': 'js/demofliocloud.js',
  'popup': 'js/popup/index.js',
  'editor': 'js/editor/index.js',
  'processor': 'js/processor.js',
  'config': 'js/config/index.js',
  'overview': 'js/popup/overview-loader.js',
  'personas': 'js/popup/personas-loader.js'
};

export default defineConfig(({ mode }) => {
  const entryName = mode;
  const entryPath = entryMappings[entryName];
  
  if (!entryPath) {
    throw new Error(`Unknown mode: ${mode}`);
  }

  return {
    build: {
      outDir: 'dist',
      emptyOutDir: false, // Don't empty since we're building multiple files
      lib: {
        entry: resolve(process.cwd(), entryPath),
        name: `${entryName.replace('-', '')}Bundle`,
        fileName: () => `${entryName}-bundle.js`,
        formats: ['iife']
      },
      rollupOptions: {
        output: {
          extend: true,
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return `${entryName}.css`;
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      minify: 'terser'
    },
    css: {
      postcss: './postcss.config.js'
    }
  };
});
