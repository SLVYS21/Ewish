import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'https://hammerhead-app-mk9qz.ondigitalocean.app',
      '/site': 'https://hammerhead-app-mk9qz.ondigitalocean.app',
      '/uploads': 'https://hammerhead-app-mk9qz.ondigitalocean.app',
    },
  },
});