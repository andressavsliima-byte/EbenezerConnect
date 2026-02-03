import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use VITE_PORT if provided; fall back to 5000 to align frontend with backend proxy
const port = process.env.VITE_PORT ? parseInt(process.env.VITE_PORT, 10) : 5000
const strictPort = true

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
