import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createFMPFetcher, aggregateStockData } from './api/lib/aggregator.js'

// Dev middleware that handles /api/stock/:ticker using the shared aggregator,
// so `npm run dev` works without the Vercel CLI.
function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url.match(/^\/api\/stock\/([A-Za-z]+)/)
        if (!match) return next()

        const ticker = match[1].toUpperCase()
        const apiKey = process.env.FMP_API_KEY || process.env.VITE_FMP_API_KEY || 'demo'

        try {
          const fetchJSON = createFMPFetcher(apiKey)
          const data = await aggregateStockData(ticker, fetchJSON)

          if (!data) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: 'Company not found' }))
          }

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300',
          })
          res.end(JSON.stringify(data))
        } catch (err) {
          console.error('API dev middleware error:', err.message)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Failed to fetch company data' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiMiddleware()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
