import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';
import { join } from 'path';

// Try to get the API key from environment variables
const apiKey = process.env.SHOPIFY_API_KEY || process.env.VITE_SHOPIFY_API_KEY || '';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Use a placeholder value for development
    'process.env.VITE_SHOPIFY_API_KEY': JSON.stringify(apiKey || 'PLACEHOLDER_API_KEY'),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Prevent warning about missing externals
      external: [],
    },
  },
  server: {
    host: "localhost",
    port: 3000,
    proxy: {
      "^/(\\?.*)?$": "http://localhost:8081",
      "^/api(/|$)": "http://localhost:8081",
      "^/carrier-service(/|$)": "http://localhost:8081",
    },
  },
});