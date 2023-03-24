/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import eslintPlugin from '@nabla/vite-plugin-eslint';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // root (= ./src) から見た相対パスで指定
    outDir: '../dist',
  },
  publicDir: '../public',
  root: './src',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.browser': true,
    'process.env': {},
  },
  server: {
    port: 3000,
  },
  test: {
    coverage: {
      provider: 'c8',
      reportsDirectory: '../coverage',
    },
    environment: 'happy-dom',
    setupFiles: './dev/setup.ts',
    deps: {
      external: ['**/dist/**'],
    },
  },
  plugins: [
    react({ plugins: [['@swc/plugin-styled-components', {}]] }),
    eslintPlugin({
      eslintOptions: {
        cache: true,
        cacheLocation: 'node_modules/.cache/.eslintcache',
      },
    }),
  ],
});
