import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: 'dist',
  },

  server: {
    port: 4000,
    proxy: {
      // In dev, proxy API calls to local Express
      '/api': {
        target: 'https://hammerhead-app-mk9qz.ondigitalocean.app',
        changeOrigin: true,
      },
      '/preview': {
        target: 'https://hammerhead-app-mk9qz.ondigitalocean.app',
        changeOrigin: true,
      },
    },
  },

  define: {
    // Injected at build time from .env
    // Usage in code: import.meta.env.VITE_API_URL
  },
});