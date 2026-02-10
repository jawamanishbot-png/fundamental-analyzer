// Shared data aggregation logic used by both the Vercel serverless handler
// and the Vite dev middleware so they stay in sync.

export function createFMPFetcher(apiKey) {
  const base = 'https://financialmodelingprep.com/api/v3'
  return async function fetchJSON(path) {
    const sep = path.includes('?') ? '&' : '?'
    const r = await fetch(`${base}${path}${sep}apikey=${apiKey}`)
    if (!r.ok) throw new Error(`FMP API error: ${r.status}`)
    return r.json()
  }
}

export async function aggregateStockData(ticker, fetchJSON) {
  // 1. Company profile (required)
  const profileData = await fetchJSON(`/profile/${ticker}`)
  if (!profileData?.length) return null

  const profile = profileData[0]

  // 2. Income statement – revenue growth + profitability margins
  const incomeData = await fetchJSON(`/income-statement/${ticker}?limit=5`)
  const latestIncome = incomeData?.[0] || {}
  const revenues = incomeData?.map(i => i.revenue).filter(Boolean) || []
  const revenueGrowth = revenues.length >= 2
    ? ((revenues[0] - revenues[1]) / revenues[1]) * 100
    : null

  const grossMargin = latestIncome.revenue && latestIncome.grossProfit
    ? (latestIncome.grossProfit / latestIncome.revenue) * 100
    : null
  const operatingMargin = latestIncome.revenue && latestIncome.operatingIncome
    ? (latestIncome.operatingIncome / latestIncome.revenue) * 100
    : null
  const netMargin = latestIncome.revenue && latestIncome.netIncome
    ? (latestIncome.netIncome / latestIncome.revenue) * 100
    : null
  const eps = latestIncome.eps ?? null

  // Build revenue history (most recent 5, reversed to chronological)
  const revenueHistory = incomeData
    ?.filter(i => i.revenue && i.calendarYear)
    .map(i => ({ year: i.calendarYear, revenue: i.revenue }))
    .reverse() || []

  // 3. Balance sheet – financial health
  let debtToEquity = null
  let currentRatio = null
  let bookValuePerShare = null
  let totalDebt = null
  let totalCash = null
  try {
    const bsData = await fetchJSON(`/balance-sheet-statement/${ticker}?limit=1`)
    const bs = bsData?.[0]
    if (bs) {
      if (bs.totalStockholdersEquity && bs.totalDebt) {
        debtToEquity = bs.totalDebt / bs.totalStockholdersEquity
      }
      if (bs.totalCurrentAssets && bs.totalCurrentLiabilities) {
        currentRatio = bs.totalCurrentAssets / bs.totalCurrentLiabilities
      }
      if (bs.totalStockholdersEquity && bs.commonStock) {
        // FMP provides shares outstanding via profile
        const shares = profile.mktCap && profile.price
          ? profile.mktCap / profile.price
          : null
        if (shares) {
          bookValuePerShare = bs.totalStockholdersEquity / shares
        }
      }
      totalDebt = bs.totalDebt || null
      totalCash = bs.cashAndCashEquivalents || null
    }
  } catch { /* balance sheet not critical */ }

  // 4. Cash flow statement
  let freeCashFlow = null
  let operatingCashFlow = null
  let capex = null
  try {
    const cfData = await fetchJSON(`/cash-flow-statement/${ticker}?limit=1`)
    const cf = cfData?.[0]
    if (cf) {
      freeCashFlow = cf.freeCashFlow ?? null
      operatingCashFlow = cf.operatingCashFlow ?? null
      capex = cf.capitalExpenditure ?? null
    }
  } catch { /* cash flow not critical */ }

  // 5. Quote – current market data
  const quoteData = await fetchJSON(`/quote/${ticker}`)
  const quote = quoteData?.[0] || {}

  // 6. Historical prices (30 trading days for sparkline)
  let priceHistory = []
  try {
    const histData = await fetchJSON(
      `/historical-price-full/${ticker}?timeseries=30`
    )
    if (histData?.historical) {
      priceHistory = histData.historical
        .map(d => ({ date: d.date, close: d.close }))
        .reverse() // chronological order
    }
  } catch { /* historical not critical */ }

  // 7. Earnings estimates (premium – may fail on free tier)
  let nextQuarterEPS = null
  try {
    const est = await fetchJSON(`/earning_calendar/${ticker}?limit=4`)
    if (est?.length) nextQuarterEPS = est[0].epsEstimated
  } catch { /* estimates not critical */ }

  // Derived values
  const currentPrice = quote.price || profile.price || null
  const forwardPE = quote.priceToEarningsRatio || profile.priceToEarningsRatio || null
  const forwardEPS = currentPrice && forwardPE
    ? parseFloat((currentPrice / forwardPE).toFixed(2))
    : null
  const yearHigh = quote.yearHigh || null
  const yearLow = quote.yearLow || null
  const dayChange = quote.change || null
  const dayChangePercent = quote.changesPercentage || null
  const volume = quote.volume || null
  const avgVolume = quote.avgVolume || null

  return {
    // Company info
    symbol: ticker.toUpperCase(),
    name: profile.companyName || 'Unknown',
    industry: profile.industry || 'Unknown',
    sector: profile.sector || null,
    description: profile.description || null,
    ceo: profile.ceo || null,
    website: profile.website || null,
    employees: profile.fullTimeEmployees || null,
    ipoDate: profile.ipoDate || null,
    exchange: profile.exchangeShortName || null,
    country: profile.country || null,

    // Market data
    marketCap: profile.mktCap ? `$${(profile.mktCap / 1e9).toFixed(1)}B` : 'N/A',
    marketCapRaw: profile.mktCap || null,
    currentPrice,
    dayChange,
    dayChangePercent,
    volume,
    avgVolume,
    yearHigh,
    yearLow,
    beta: profile.beta || null,

    // Valuation
    forwardPE,
    forwardEPS,
    peRatio: forwardPE,
    priceTarget: profile.analyticTarget || null,

    // Earnings
    eps,
    nextQuarterEPS,

    // Growth
    revenueGrowth,
    revenueHistory,

    // Profitability
    grossMargin,
    operatingMargin,
    netMargin,

    // Financial health (balance sheet)
    debtToEquity,
    currentRatio,
    bookValuePerShare,
    totalDebt,
    totalCash,

    // Cash flow
    freeCashFlow,
    operatingCashFlow,
    capex,

    // Price history (sparkline)
    priceHistory,

    // Dividend
    dividendYield: profile.lastDiv && currentPrice
      ? (profile.lastDiv / currentPrice) * 100
      : null,
  }
}

// Format large numbers for display
export function formatLargeNumber(num) {
  if (num == null) return 'N/A'
  const abs = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  return `${sign}$${abs.toLocaleString()}`
}
