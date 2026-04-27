import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': { target: 'https://remote-team-manager-production.up.railway.app', changeOrigin: true } } },
  build: {
    rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand', 'react-hot-toast'] } } },
    chunkSizeWarningLimit: 500,
  },
})
