import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../stock/[ticker].js'

function mockReq(method = 'GET', query = {}) {
  return { method, query }
}

function mockRes() {
  const res = {
    statusCode: null,
    headers: {},
    body: null,
    status(code) { res.statusCode = code; return res },
    setHeader(key, value) { res.headers[key] = value; return res },
    json(data) { res.body = data; return res },
  }
  return res
}

// Default mock that returns sensible empty data for all endpoints
function mockAllFMP(overrides = {}) {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    if (url.includes('/profile/')) return { ok: true, json: async () => overrides.profile ?? [{ companyName: 'Test', industry: 'Tech' }] }
    if (url.includes('/income-statement/')) return { ok: true, json: async () => overrides.income ?? [] }
    if (url.includes('/balance-sheet-statement/')) return { ok: true, json: async () => overrides.balanceSheet ?? [] }
    if (url.includes('/cash-flow-statement/')) return { ok: true, json: async () => overrides.cashFlow ?? [] }
    if (url.includes('/quote/')) return { ok: true, json: async () => overrides.quote ?? [{}] }
    if (url.includes('/historical-price-full/')) return { ok: true, json: async () => overrides.history ?? { historical: [] } }
    if (url.includes('/earning_calendar/')) {
      if (overrides.earningsThrow) throw new Error('API down')
      return { ok: true, json: async () => overrides.earnings ?? [] }
    }
    return { ok: true, json: async () => [] }
  })
}

describe('API handler: /api/stock/[ticker]', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 405 for non-GET requests', async () => {
    const res = mockRes()
    await handler(mockReq('POST', { ticker: 'AAPL' }), res)

    expect(res.statusCode).toBe(405)
    expect(res.body).toEqual({ error: 'Method not allowed' })
  })

  it('returns 400 when ticker is missing', async () => {
    const res = mockRes()
    await handler(mockReq('GET', {}), res)

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Ticker is required' })
  })

  it('returns 404 when company is not found', async () => {
    mockAllFMP({ profile: [] })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'ZZZZZ' }), res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Company not found' })
  })

  it('returns 200 with aggregated data for valid ticker', async () => {
    mockAllFMP({
      profile: [{ companyName: 'Apple Inc.', industry: 'Technology', mktCap: 2.8e12, price: 195.5, priceToEarningsRatio: 28.3, analyticTarget: 210, sector: 'Tech' }],
      income: [{ revenue: 394e9, grossProfit: 180e9, operatingIncome: 120e9, netIncome: 100e9, calendarYear: '2025' }, { revenue: 365e9, calendarYear: '2024' }],
      balanceSheet: [{ totalDebt: 111e9, totalStockholdersEquity: 62e9, totalCurrentAssets: 100e9, totalCurrentLiabilities: 110e9, cashAndCashEquivalents: 30e9 }],
      cashFlow: [{ freeCashFlow: 111e9, operatingCashFlow: 122e9, capitalExpenditure: -11e9 }],
      quote: [{ price: 195.5, priceToEarningsRatio: 28.3, yearHigh: 220, yearLow: 150 }],
      history: { historical: [{ date: '2026-01-02', close: 195 }, { date: '2026-01-01', close: 190 }] },
      earnings: [{ epsEstimated: 1.75 }],
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'AAPL' }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body.symbol).toBe('AAPL')
    expect(res.body.name).toBe('Apple Inc.')
    expect(res.body.currentPrice).toBe(195.5)
    expect(res.body.forwardPE).toBe(28.3)
    expect(res.body.nextQuarterEPS).toBe(1.75)
    expect(res.body.priceTarget).toBe(210)
    expect(res.body.freeCashFlow).toBe(111e9)
    expect(res.body.debtToEquity).toBeCloseTo(1.79, 1)
    expect(res.body.priceHistory).toHaveLength(2)
  })

  it('calculates revenue growth from income data', async () => {
    mockAllFMP({
      income: [{ revenue: 200 }, { revenue: 100 }],
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.body.revenueGrowth).toBe(100)
  })

  it('returns null revenue growth with insufficient data', async () => {
    mockAllFMP({
      income: [{ revenue: 100 }],
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.body.revenueGrowth).toBeNull()
  })

  it('sets cache header on success', async () => {
    mockAllFMP()

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.headers['Cache-Control']).toBe('public, max-age=300')
  })

  it('returns 404 when FMP API is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'AAPL' }), res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Company not found' })
  })

  it('returns partial data when non-critical endpoints fail', async () => {
    // Profile succeeds, everything else fails
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.includes('/profile/')) return { ok: true, json: async () => [{ companyName: 'Test Corp', industry: 'Tech', mktCap: 1e9, price: 50 }] }
      throw new Error('Endpoint unavailable')
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe('Test Corp')
    expect(res.body.currentPrice).toBe(50)
    // Non-critical fields should be null/empty, not crash
    expect(res.body.revenueGrowth).toBeNull()
    expect(res.body.freeCashFlow).toBeNull()
    expect(res.body.priceHistory).toEqual([])
  })

  it('handles missing earnings gracefully', async () => {
    mockAllFMP({ earningsThrow: true })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body.nextQuarterEPS).toBeNull()
  })
})
