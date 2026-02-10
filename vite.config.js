import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev middleware that handles /api/stock/:ticker the same way the Vercel
// serverless function does, so `npm run dev` works without the Vercel CLI.
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
          const base = 'https://financialmodelingprep.com/api/v3'
          const fetchJSON = async (path) => {
            const r = await fetch(`${base}${path}${path.includes('?') ? '&' : '?'}apikey=${apiKey}`)
            if (!r.ok) throw new Error(`FMP ${r.status}`)
            return r.json()
          }

          const profileData = await fetchJSON(`/profile/${ticker}`)
          if (!profileData?.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: 'Company not found' }))
          }

          const profile = profileData[0]
          const incomeData = await fetchJSON(`/income-statement/${ticker}?limit=5`)
          const revenues = incomeData?.map(i => i.revenue).filter(Boolean) || []
          const revenueGrowth = revenues.length >= 2
            ? ((revenues[0] - revenues[1]) / revenues[1]) * 100
            : null

          const quoteData = await fetchJSON(`/quote/${ticker}`)
          const quote = quoteData?.[0] || {}

          let nextQuarterEPS = null
          try {
            const est = await fetchJSON(`/earning_calendar/${ticker}?limit=4`)
            if (est?.length) nextQuarterEPS = est[0].epsEstimated
          } catch { /* not critical */ }

          const data = {
            symbol: ticker,
            name: profile.companyName || 'Unknown',
            industry: profile.industry || 'Unknown',
            marketCap: profile.mktCap ? `$${(profile.mktCap / 1e9).toFixed(1)}B` : 'N/A',
            currentPrice: quote.price || profile.price || null,
            forwardPE: quote.priceToEarningsRatio || profile.priceToEarningsRatio || null,
            forwardEPS: quote.price && quote.priceToEarningsRatio
              ? parseFloat((quote.price / quote.priceToEarningsRatio).toFixed(2))
              : null,
            nextQuarterEPS,
            peRatio: quote.priceToEarningsRatio || profile.priceToEarningsRatio || null,
            revenueGrowth,
            priceTarget: profile.analyticTarget || null,
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
