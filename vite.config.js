import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { existsSync } from 'fs';

export default defineConfig(({ mode }) => {
  // Helper function to find the correct entry file (.ts or .js)
  const findEntryFile = (basePath) => {
    const tsPath = basePath.replace('.js', '.ts');
    const jsPath = basePath;
    
    if (existsSync(resolve(process.cwd(), tsPath))) {
      return tsPath;
    } else if (existsSync(resolve(process.cwd(), jsPath))) {
      return jsPath;
    } else {
      throw new Error(`Entry file not found: ${basePath} (tried .ts and .js)`);
    }
  };

  // Extension entry points - will automatically use .ts if available, fallback to .js
  const extensionEntries = {
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

  // If building a specific extension entry
  if (extensionEntries[mode]) {
    return {
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve(process.cwd(), findEntryFile(extensionEntries[mode])),
          name: `${mode.replace('-', '')}Bundle`,
          fileName: () => `${mode}-bundle.js`,
          formats: ['iife']
        },
        rollupOptions: {
          output: {
            extend: true,
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return `${mode}.css`; // Put CSS files in root dist/ to match HTML expectations
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
  }

  // Static files or multi-entry build
  return {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'manifest.json',
            dest: '.'
          },
          {
            src: 'html/*',
            dest: 'html'
          },
          {
            src: 'assets/*',
            dest: 'assets'
          },
          {
            src: 'demos/*',
            dest: 'demos'
          },
          {
            src: 'pictures/*',
            dest: 'pictures'
          },
          {
            src: 'logos/*',
            dest: 'logos'
          }
        ]
      })
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: mode === 'static-only' ? { dummy: new URL('data:text/javascript,').href } : Object.fromEntries(
          Object.entries(extensionEntries).map(([key, path]) => [key, resolve(process.cwd(), findEntryFile(path))])
        ),
        output: {
          entryFileNames: '[name]-bundle.js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'css/[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      minify: 'terser',
      target: ['chrome88', 'firefox78']
    },
    css: {
      postcss: './postcss.config.js'
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
    }
  };
});
