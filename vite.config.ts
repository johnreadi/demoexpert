import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://localhost:8085',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [react()],
    define: {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        // Remove the problematic alias that might be causing conflicts
      },
      // Add extensions to resolve
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      // Remove the exclude that might be causing issues
    }
  };
});