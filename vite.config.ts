import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: [
        '**/public/**',
        '**/server/**',
        '**/*.mp4',
        '**/*.mp3',
        '**/*.m4a',
        '**/*.webm',
        '**/*.part',
        '**/*.tmp',
        '**/temp/**',
        '**/downloads/**',
        '**/dist/**',
      ],
    },
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
