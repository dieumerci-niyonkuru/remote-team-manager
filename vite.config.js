import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  server: {
    port: 5174,
    strictPort: true,
    headers: {
      // Prevent browser/SW from caching the HTML shell and SW script
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    },
    proxy: {
      '/api': {
        target: 'https://remote-team-manager-production.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
