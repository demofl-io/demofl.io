import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  // Extension entry points
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
          entry: resolve(process.cwd(), extensionEntries[mode]),
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
          Object.entries(extensionEntries).map(([key, path]) => [key, resolve(process.cwd(), path)])
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
      extensions: ['.js', '.json']
    }
  };
});
