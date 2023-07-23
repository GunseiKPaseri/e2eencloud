import path from 'path';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';

const relativePath = (...list: string[]) => path.resolve(__dirname, ...list);

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  // root (= ./src) から見た相対パスで指定
  build: {
    outDir: relativePath('dist'),
  },
  publicDir: relativePath('public'),
  resolve: {
    alias: {
      '~': relativePath('src'),
    },
  },
  define: {
    'process.browser': true,
    'process.env': {},
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: relativePath('coverage'),
    },
    cache: {dir: relativePath('node_modules', '.vitest')},
    environment: 'happy-dom',
    setupFiles: relativePath('src', 'dev', 'setup.ts'),
    deps: {
      external: ['**/dist/**'],
    },
  },
  plugins: [
    react({ plugins: [['@swc/plugin-styled-components', {}]] }),
    checker({
      typescript: true,
      eslint: {
        lintCommand: `eslint ${
          relativePath('src')
        } --ext ts,tsx --ignore-path ${
          relativePath('.gitignore')
        } --cache --cache-location ${
          relativePath('node_modules', '.cache', '.eslintcache')
        }`,
      },
    }),
  ],
});
