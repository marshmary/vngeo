import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log, console.info, console.debug in production
        // Keep console.error, console.warn for debugging production issues
        drop_console: false,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
  },
  esbuild: {
    // Remove debugger statements in development and production
    drop: ['debugger'],
  },
})
