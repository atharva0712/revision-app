import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
      },
    },
    outDir: 'dist',
    emptyOutDir: false, // Don't empty dist since we need to copy static files
  },
  define: {
    global: 'globalThis',
  }
})
