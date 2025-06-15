import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
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
            src: 'css/input.css',
            dest: 'css'
          },
          {
            src: 'css/components/*',
            dest: 'css'
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
      emptyOutDir: false, // Don't empty since extension files are built first
      rollupOptions: {
        // For static-only mode, create a dummy input so static files can be copied
        input: mode === 'static-only' ? { dummy: new URL('data:text/javascript,').href } : undefined,
        output: {
          entryFileNames: '[name]-bundle.js',
          chunkFileNames: '[name]-[hash].js',
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
