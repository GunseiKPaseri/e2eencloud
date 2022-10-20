/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import reactJsx from 'vite-react-jsx'
import manifestSRI from 'vite-plugin-manifest-sri'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // root (= ./src) から見た相対パスで指定
    outDir: '../dist'
  },
  publicDir: '../public',
  root: './src',
  define: {
    'process.browser': true,
    'process.env': {}
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './setup.ts',
    deps: {
      external: ['**\/dist\/**']
    }
  },
  plugins: [
    manifestSRI({ algorithms: ['sha384', 'sha512'] }),
    reactJsx()
  ]
})
