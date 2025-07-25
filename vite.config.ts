import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import dotenv from "dotenv";
import tailwindcss from '@tailwindcss/vite';

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api/': {
        target: 'https://api-sandbox.starlingbank.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v2'),
        headers: {
          Authorization: `Bearer ${process.env.VITE_ACCESS_TOKEN}`
        }
      }
    }
  },
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
  define: {
    "process.env.VITE_ACCESS_TOKEN": JSON.stringify(process.env.VITE_ACCESS_TOKEN),
  },
})
