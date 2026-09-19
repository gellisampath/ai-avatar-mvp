import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const anthropicKey = env.ANTHROPIC_API_KEY || env.VITE_ANTHROPIC_API_KEY || ''
  const anthropicVersion = env.VITE_ANTHROPIC_VERSION || '2023-06-01'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/anthropic/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (anthropicKey) {
                proxyReq.setHeader('x-api-key', anthropicKey)
              }
              proxyReq.setHeader('anthropic-version', anthropicVersion)
              // Drop browser-only header if present
              proxyReq.removeHeader('anthropic-dangerous-direct-browser-access')
            })
          },
        },
      },
    },
  }
})
