import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy pour le développement local, pour que les requêtes /api soient redirigées vers le serveur backend
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // L'URL de votre serveur backend local
        changeOrigin: true,
      },
    }
  }
})
