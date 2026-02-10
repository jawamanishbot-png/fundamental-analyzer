import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from '../App'
import { mockCompany } from '../test/fixtures'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders header with app name', () => {
    render(<App />)

    expect(screen.getByText('FundAnalyze')).toBeInTheDocument()
    expect(screen.getByText('Fundamental Analysis')).toBeInTheDocument()
  })

  it('renders search and watchlist tabs', () => {
    render(<App />)

    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Watchlist')).toBeInTheDocument()
  })

  it('shows search tab by default', () => {
    render(<App />)

    expect(screen.getByPlaceholderText('Search ticker symbol...')).toBeInTheDocument()
  })

  it('shows empty state message initially', () => {
    render(<App />)

    expect(screen.getByText('Search a ticker to get started')).toBeInTheDocument()
  })

  it('switches to watchlist tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByText('Watchlist'))

    expect(screen.getByText('No companies saved yet')).toBeInTheDocument()
  })

  it('shows error message when search fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
    })

    render(<App />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    await user.type(input, 'ZZZZZ')
    await user.click(screen.getByRole('button', { name: 'Analyze' }))

    await waitFor(() => {
      expect(screen.getByText('Search Failed')).toBeInTheDocument()
      expect(screen.getByText('Company not found')).toBeInTheDocument()
    })
  })

  it('displays company card after successful search', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompany,
    })

    render(<App />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    await user.type(input, 'AAPL')
    await user.click(screen.getByRole('button', { name: 'Analyze' }))

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
      expect(screen.getByText('$195.50')).toBeInTheDocument()
    })
  })

  it('can add company to watchlist', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompany,
    })

    render(<App />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    await user.type(input, 'AAPL')
    await user.click(screen.getByRole('button', { name: 'Analyze' }))

    await waitFor(() => {
      expect(screen.getByText('Watch')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Watch'))

    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('fundamentalWatchlist'))).toHaveLength(1)
  })

  it('shows watchlist badge count after adding company', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompany,
    })

    render(<App />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    await user.type(input, 'AAPL')
    await user.click(screen.getByRole('button', { name: 'Analyze' }))

    await waitFor(() => {
      expect(screen.getByText('Watch')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Watch'))

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('loads watchlist from localStorage on mount', () => {
    localStorage.setItem('fundamentalWatchlist', JSON.stringify([mockCompany]))

    render(<App />)

    // Badge should show 1
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('can remove company from watchlist', async () => {
    const user = userEvent.setup()
    localStorage.setItem('fundamentalWatchlist', JSON.stringify([mockCompany]))

    render(<App />)

    await user.click(screen.getByText('Watchlist'))

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })

    await user.click(screen.getByTitle('Remove from watchlist'))

    expect(screen.getByText('No companies saved yet')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('fundamentalWatchlist'))).toHaveLength(0)
  })

  it('shows Live indicator in header', () => {
    render(<App />)

    expect(screen.getByText('Live')).toBeInTheDocument()
  })

  it('shows popular ticker shortcuts', () => {
    render(<App />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
  })

  it('fetches data when popular ticker is clicked', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompany,
    })

    render(<App />)

    await user.click(screen.getByText('AAPL'))

    expect(fetchSpy).toHaveBeenCalledWith('/api/stock/AAPL')

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    })
  })
})
