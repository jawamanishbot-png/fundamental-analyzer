import { createFMPFetcher, aggregateStockData } from '../lib/aggregator.js'

const FMP_API_KEY = process.env.FMP_API_KEY || 'demo'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ticker } = req.query

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Ticker is required' })
  }

  try {
    const fetchJSON = createFMPFetcher(FMP_API_KEY)
    const data = await aggregateStockData(ticker.toUpperCase(), fetchJSON)

    if (!data) {
      return res.status(404).json({ error: 'Company not found' })
    }

    res.setHeader('Cache-Control', 'public, max-age=300')
    res.status(200).json(data)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Failed to fetch company data' })
  }
}
