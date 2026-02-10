// Financial Modeling Prep API key - get free from https://site.financialmodelingprep.com
// Set as VITE_FMP_API_KEY in .env.local and as FMP_API_KEY in Vercel env vars
const FMP_API_KEY = process.env.FMP_API_KEY || 'demo' // Demo key has limits

async function fetchFromFMP(endpoint) {
  const url = `https://financialmodelingprep.com/api/v3${endpoint}&apikey=${FMP_API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status}`)
  }
  return response.json()
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ticker } = req.query

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Ticker is required' })
  }

  try {
    // Fetch company profile
    const profileData = await fetchFromFMP(`/profile/${ticker}`)
    if (!profileData || profileData.length === 0) {
      return res.status(404).json({ error: 'Company not found' })
    }

    const profile = profileData[0]

    // Fetch income statement for revenue growth
    const incomeData = await fetchFromFMP(`/income-statement/${ticker}?limit=5`)
    const revenues = incomeData?.map(item => item.revenue).filter(Boolean) || []
    let revenueGrowth = null
    if (revenues.length >= 2) {
      revenueGrowth = ((revenues[0] - revenues[1]) / revenues[1]) * 100
    }

    // Fetch quote for current price
    const quoteData = await fetchFromFMP(`/quote/${ticker}`)
    const quote = quoteData?.[0] || {}

    // Fetch analyst estimates (forward-looking)
    let forwardEPS = null
    let nextQuarterEPS = null
    let priceTarget = null
    
    try {
      // Try to get earnings estimates
      const estimatesData = await fetch(
        `https://financialmodelingprep.com/api/v3/earning_calendar/${ticker}?limit=4&apikey=${FMP_API_KEY}`
      ).then(r => r.json())
      
      if (estimatesData && estimatesData.length > 0) {
        nextQuarterEPS = estimatesData[0].epsEstimated
      }
    } catch (e) {
      // Estimates not critical
    }

    // Compile response with forward-looking metrics
    const data = {
      symbol: ticker.toUpperCase(),
      name: profile.companyName || 'Unknown',
      industry: profile.industry || 'Unknown',
      marketCap: profile.mktCap ? `$${(profile.mktCap / 1e9).toFixed(1)}B` : 'N/A',
      currentPrice: quote.price || profile.price || null,
      forwardPE: quote.priceToEarningsRatio || profile.priceToEarningsRatio || null,
      forwardEPS: forwardEPS || (quote.price && quote.priceToEarningsRatio ? (quote.price / quote.priceToEarningsRatio).toFixed(2) : null),
      nextQuarterEPS: nextQuarterEPS || null,
      peRatio: quote.priceToEarningsRatio || profile.priceToEarningsRatio || null,
      revenueGrowth: revenueGrowth || null,
      priceTarget: profile.analyticTarget || null,
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.status(200).json(data)

  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: 'Failed to fetch company data' })
  }
}
