import { describe, it, expect, vi } from 'vitest'
import { createFMPFetcher, aggregateStockData, formatLargeNumber } from '../lib/aggregator.js'

describe('aggregateStockData', () => {
  function mockFetchJSON(responses) {
    return async (path) => {
      if (path.includes('/profile/')) return responses.profile ?? []
      if (path.includes('/income-statement/')) return responses.income ?? []
      if (path.includes('/balance-sheet-statement/')) return responses.balanceSheet ?? []
      if (path.includes('/cash-flow-statement/')) return responses.cashFlow ?? []
      if (path.includes('/quote/')) return responses.quote ?? []
      if (path.includes('/historical-price-full/')) return responses.history ?? { historical: [] }
      if (path.includes('/earning_calendar/')) return responses.earnings ?? []
      return []
    }
  }

  it('returns null when profile is empty', async () => {
    const result = await aggregateStockData('XYZ', mockFetchJSON({ profile: [] }))
    expect(result).toBeNull()
  })

  it('returns symbol and name from profile', async () => {
    const result = await aggregateStockData('AAPL', mockFetchJSON({
      profile: [{ companyName: 'Apple Inc.', industry: 'Technology', sector: 'Tech' }],
    }))
    expect(result.symbol).toBe('AAPL')
    expect(result.name).toBe('Apple Inc.')
    expect(result.industry).toBe('Technology')
  })

  it('calculates revenue growth from income statements', async () => {
    const result = await aggregateStockData('TEST', mockFetchJSON({
      profile: [{ companyName: 'Test' }],
      income: [{ revenue: 200, calendarYear: '2025' }, { revenue: 100, calendarYear: '2024' }],
    }))
    expect(result.revenueGrowth).toBe(100)
  })

  it('calculates profitability margins', async () => {
    const result = await aggregateStockData('TEST', mockFetchJSON({
      profile: [{ companyName: 'Test' }],
      income: [{ revenue: 1000, grossProfit: 500, operatingIncome: 300, netIncome: 200 }],
    }))
    expect(result.grossMargin).toBe(50)
    expect(result.operatingMargin).toBe(30)
    expect(result.netMargin).toBe(20)
  })

  it('extracts balance sheet metrics', async () => {
    const result = await aggregateStockData('TEST', mockFetchJSON({
      profile: [{ companyName: 'Test', mktCap: 1000, price: 10 }],
      balanceSheet: [{
        totalDebt: 500,
        totalStockholdersEquity: 1000,
        totalCurrentAssets: 300,
        totalCurrentLiabilities: 200,
        cashAndCashEquivalents: 150,
      }],
    }))
    expect(result.debtToEquity).toBe(0.5)
    expect(result.currentRatio).toBe(1.5)
    expect(result.totalDebt).toBe(500)
    expect(result.totalCash).toBe(150)
  })

  it('extracts cash flow metrics', async () => {
    const result = await aggregateStockData('TEST', mockFetchJSON({
      profile: [{ companyName: 'Test' }],
      cashFlow: [{ freeCashFlow: 50, operatingCashFlow: 80, capitalExpenditure: -30 }],
    }))
    expect(result.freeCashFlow).toBe(50)
    expect(result.operatingCashFlow).toBe(80)
    expect(result.capex).toBe(-30)
  })

  it('extracts price history for sparkline', async () => {
    const result = await aggregateStockData('TEST', mockFetchJSON({
      profile: [{ companyName: 'Test' }],
      history: {
        historical: [
          { date: '2026-01-02', close: 102 },
          { date: '2026-01-01', close: 100 },
        ]
      },
    }))
    expect(result.priceHistory).toHaveLength(2)
    // Should be reversed to chronological
    expect(result.priceHistory[0].close).toBe(100)
    expect(result.priceHistory[1].close).toBe(102)
  })

  it('extracts 52-week range from quote', async () => {
    const result = await aggregateStockData('TEST', mockFetchJSON({
      profile: [{ companyName: 'Test' }],
      quote: [{ price: 150, yearHigh: 200, yearLow: 100 }],
    }))
    expect(result.yearHigh).toBe(200)
    expect(result.yearLow).toBe(100)
  })

  it('handles earnings calendar failure gracefully', async () => {
    const fetchJSON = async (path) => {
      if (path.includes('/profile/')) return [{ companyName: 'Test' }]
      if (path.includes('/earning_calendar/')) throw new Error('Premium only')
      return []
    }
    const result = await aggregateStockData('TEST', fetchJSON)
    expect(result.nextQuarterEPS).toBeNull()
  })

  it('calculates dividend yield from profile', async () => {
    const result = await aggregateStockData('TEST', mockFetchJSON({
      profile: [{ companyName: 'Test', lastDiv: 2, price: 100 }],
      quote: [{ price: 100 }],
    }))
    expect(result.dividendYield).toBe(2)
  })
})

describe('formatLargeNumber', () => {
  it('returns N/A for null', () => {
    expect(formatLargeNumber(null)).toBe('N/A')
  })

  it('formats trillions', () => {
    expect(formatLargeNumber(2800000000000)).toBe('$2.80T')
  })

  it('formats billions', () => {
    expect(formatLargeNumber(48200000000)).toBe('$48.20B')
  })

  it('formats millions', () => {
    expect(formatLargeNumber(5600000)).toBe('$5.6M')
  })

  it('handles negative numbers', () => {
    expect(formatLargeNumber(-11000000000)).toBe('-$11.00B')
  })
})
