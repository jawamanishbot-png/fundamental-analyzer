export const mockCompany = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  industry: 'Technology',
  marketCap: '$2.8T',
  currentPrice: 195.5,
  forwardPE: 28.3,
  forwardEPS: 6.89,
  nextQuarterEPS: 1.75,
  peRatio: 28.3,
  revenueGrowth: 5.2,
  priceTarget: 210.0,
}

export const mockUndervaluedCompany = {
  symbol: 'F',
  name: 'Ford Motor Company',
  industry: 'Auto Manufacturers',
  marketCap: '$48.2B',
  currentPrice: 12.05,
  forwardPE: 6.8,
  forwardEPS: 1.77,
  nextQuarterEPS: 0.45,
  peRatio: 6.8,
  revenueGrowth: 3.1,
  priceTarget: 15.0,
}

export const mockFairValueCompany = {
  symbol: 'JNJ',
  name: 'Johnson & Johnson',
  industry: 'Drug Manufacturers',
  marketCap: '$380.5B',
  currentPrice: 158.2,
  forwardPE: 18.5,
  forwardEPS: 8.55,
  nextQuarterEPS: 2.1,
  peRatio: 18.5,
  revenueGrowth: 2.8,
  priceTarget: 175.0,
}

export const mockMinimalCompany = {
  symbol: 'XYZ',
  name: 'XYZ Corp',
  industry: null,
  marketCap: null,
  currentPrice: null,
  forwardPE: null,
  forwardEPS: null,
  nextQuarterEPS: null,
  peRatio: null,
  revenueGrowth: null,
  priceTarget: null,
}

export const mockApiResponse = {
  ok: true,
  json: async () => mockCompany,
}

export const mockApiErrorResponse = {
  ok: false,
  status: 404,
}
