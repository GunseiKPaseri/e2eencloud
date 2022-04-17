/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import reactJsx from 'vite-react-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // root (= ./src) から見た相対パスで指定
    outDir: '../dist'
  },
  root: './src',
  define: {
    'process.browser': true,
    'process.env': {}
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/setup.ts',
    deps: {
      external: ['**\/dist\/**']
    }
  },
  plugins: [
    reactJsx()
  ]
})
