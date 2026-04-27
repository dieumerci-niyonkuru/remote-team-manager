import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://remote-team-manager-production.up.railway.app',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('axios') || id.includes('zustand') || id.includes('react-hot-toast')) {
              return 'vendor-utils'
            }
            return 'vendor'
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
  },
})
