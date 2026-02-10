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
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'ZZZZZ' }), res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Company not found' })
  })

  it('returns 200 with aggregated data for valid ticker', async () => {
    const mockProfile = [{
      companyName: 'Apple Inc.',
      industry: 'Technology',
      mktCap: 2800000000000,
      price: 195.5,
      priceToEarningsRatio: 28.3,
      analyticTarget: 210.0,
    }]
    const mockIncome = [
      { revenue: 394000000000 },
      { revenue: 365000000000 },
    ]
    const mockQuote = [{
      price: 195.5,
      priceToEarningsRatio: 28.3,
    }]
    const mockEarnings = [{
      epsEstimated: 1.75,
    }]

    let callIndex = 0
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      callIndex++
      if (url.includes('/profile/')) return { ok: true, json: async () => mockProfile }
      if (url.includes('/income-statement/')) return { ok: true, json: async () => mockIncome }
      if (url.includes('/quote/')) return { ok: true, json: async () => mockQuote }
      if (url.includes('/earning_calendar/')) return { ok: true, json: async () => mockEarnings }
      return { ok: false }
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'AAPL' }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body.symbol).toBe('AAPL')
    expect(res.body.name).toBe('Apple Inc.')
    expect(res.body.industry).toBe('Technology')
    expect(res.body.marketCap).toBe('$2800.0B')
    expect(res.body.currentPrice).toBe(195.5)
    expect(res.body.forwardPE).toBe(28.3)
    expect(res.body.nextQuarterEPS).toBe(1.75)
    expect(res.body.priceTarget).toBe(210.0)
  })

  it('calculates revenue growth from income data', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.includes('/profile/')) return { ok: true, json: async () => [{ companyName: 'Test', industry: 'Tech', mktCap: 1e9 }] }
      if (url.includes('/income-statement/')) return { ok: true, json: async () => [{ revenue: 200 }, { revenue: 100 }] }
      if (url.includes('/quote/')) return { ok: true, json: async () => [{}] }
      if (url.includes('/earning_calendar/')) return { ok: true, json: async () => [] }
      return { ok: false }
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.body.revenueGrowth).toBe(100) // (200-100)/100 * 100
  })

  it('returns null revenue growth with insufficient data', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.includes('/profile/')) return { ok: true, json: async () => [{ companyName: 'Test' }] }
      if (url.includes('/income-statement/')) return { ok: true, json: async () => [{ revenue: 100 }] }
      if (url.includes('/quote/')) return { ok: true, json: async () => [{}] }
      if (url.includes('/earning_calendar/')) return { ok: true, json: async () => [] }
      return { ok: false }
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.body.revenueGrowth).toBeNull()
  })

  it('sets cache header on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.includes('/profile/')) return { ok: true, json: async () => [{ companyName: 'Test' }] }
      if (url.includes('/income-statement/')) return { ok: true, json: async () => [] }
      if (url.includes('/quote/')) return { ok: true, json: async () => [{}] }
      if (url.includes('/earning_calendar/')) return { ok: true, json: async () => [] }
      return { ok: false }
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.headers['Cache-Control']).toBe('public, max-age=300')
  })

  it('returns 500 when FMP API fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'AAPL' }), res)

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: 'Failed to fetch company data' })
  })

  it('handles missing earnings gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.includes('/profile/')) return { ok: true, json: async () => [{ companyName: 'Test' }] }
      if (url.includes('/income-statement/')) return { ok: true, json: async () => [] }
      if (url.includes('/quote/')) return { ok: true, json: async () => [{}] }
      if (url.includes('/earning_calendar/')) throw new Error('API down')
      return { ok: false }
    })

    const res = mockRes()
    await handler(mockReq('GET', { ticker: 'TEST' }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body.nextQuarterEPS).toBeNull()
  })
})
