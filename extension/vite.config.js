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
    emptyOutDir: true, // Clean build directory
    copyPublicDir: false, // Disable automatic copying of public dir
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    strictPort: true
  }
})
