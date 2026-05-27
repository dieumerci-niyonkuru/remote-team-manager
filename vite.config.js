import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Proxy target: use BACKEND_URL env var (for Docker) or fall back to localhost
  const backendTarget = env.BACKEND_URL || 'http://localhost:8000'
  const backendWsTarget = env.BACKEND_WS_URL || 'ws://localhost:8000'

  return {
    plugins: [react()],

    resolve: {
      dedupe: ['react', 'react-dom'],
    },

    // Expose env vars to the browser bundle (prefix with VITE_)
    // VITE_API_BASE_URL: override the API base — leave empty for same-origin /api
    envPrefix: 'VITE_',

    build: {
      outDir: 'dist',
      sourcemap: false,
      // Minify for production
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // Code-split into named chunks to keep individual file sizes small
          manualChunks(id) {
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/')
            ) {
              return 'vendor'
            }
            if (
              id.includes('node_modules/lucide-react/') ||
              id.includes('node_modules/react-hot-toast/')
            ) {
              return 'ui'
            }
            if (id.includes('node_modules/recharts/')) {
              return 'charts'
            }
            if (
              id.includes('node_modules/@tanstack/') ||
              id.includes('node_modules/zustand/') ||
              id.includes('node_modules/axios/')
            ) {
              return 'query'
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },

    server: {
      port: 5174,
      strictPort: false,
      host: '0.0.0.0',   // Allow connections from Docker host
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
      proxy: {
        // REST API
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        // WebSocket connections — Daphne / Django Channels
        '/ws': {
          target: backendWsTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
