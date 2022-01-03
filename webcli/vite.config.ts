import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // root (= ./src) から見た相対パスで指定
    outDir: '../dist',
  },
  root: './src',
  plugins: [react()],
})
