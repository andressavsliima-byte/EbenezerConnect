import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use VITE_PORT if provided; fall back to 3001 and allow Vite to pick
// another free port when VITE_PORT is not explicitly set.
const port = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 3001
const strictPort = !!process.env.VITE_PORT

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port,
    strictPort,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
