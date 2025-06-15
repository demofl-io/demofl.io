import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
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
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(process.cwd(), 'js/popup/index.js'),
        content: resolve(process.cwd(), 'js/content/index.js'),
        background: resolve(process.cwd(), 'js/background.js'),
        editor: resolve(process.cwd(), 'js/editor/index.js'),
        processor: resolve(process.cwd(), 'js/processor.js'),
        config: resolve(process.cwd(), 'js/config/index.js'),
        'auth-content': resolve(process.cwd(), 'js/auth/auth-content.js'),
        demofliocloud: resolve(process.cwd(), 'js/demofliocloud.js'),
        overview: resolve(process.cwd(), 'js/popup/overview-loader.js'),
        personas: resolve(process.cwd(), 'js/popup/personas-loader.js')
      },
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
});
