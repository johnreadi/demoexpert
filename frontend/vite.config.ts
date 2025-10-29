import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy for local development, so that frontend requests to /api
  // are forwarded to the local backend server.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Your local backend server URL
        changeOrigin: true,
      },
    }
  }
})
