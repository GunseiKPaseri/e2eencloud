/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // root (= ./src) から見た相対パスで指定
    outDir: '../dist',
  },
  publicDir: '../public',
  root: './src',
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
    },
    environment: 'happy-dom',
    setupFiles: './setup.ts',
    deps: {
      external: ['**/dist/**'],
    },
  },
  plugins: [
    react({ plugins: [['@swc/plugin-styled-components', {}]] }),
  ],
});
