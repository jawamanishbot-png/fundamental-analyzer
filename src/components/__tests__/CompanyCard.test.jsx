import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import CompanyCard from '../CompanyCard'
import { mockCompany, mockUndervaluedCompany, mockFairValueCompany, mockMinimalCompany } from '../../test/fixtures'

describe('CompanyCard', () => {
  it('renders company symbol and name', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('renders current price', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText('$195.50')).toBeInTheDocument()
  })

  it('renders price target', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText(/Target: \$210\.00/)).toBeInTheDocument()
  })

  it('calculates and displays upside percentage', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    // Upside = ((210 - 195.5) / 195.5) * 100 = 7.4%
    expect(screen.getByText(/\+7\.4%/)).toBeInTheDocument()
  })

  it('shows Overvalued for high forward P/E (>25)', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    // Appears in both badge and gauge
    const matches = screen.getAllByText('Overvalued')
    expect(matches.length).toBe(2)
  })

  it('shows Undervalued for low forward P/E (<15)', () => {
    render(<CompanyCard company={mockUndervaluedCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    const matches = screen.getAllByText('Undervalued')
    expect(matches.length).toBe(2)
  })

  it('shows Fair Value for mid-range forward P/E (15-25)', () => {
    render(<CompanyCard company={mockFairValueCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    const matches = screen.getAllByText('Fair Value')
    expect(matches.length).toBe(2)
  })

  it('renders forward metrics grid', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText('Forward P/E')).toBeInTheDocument()
    // 28.30 appears in both Forward P/E metric and P/E Ratio (TTM)
    const peValues = screen.getAllByText('28.30')
    expect(peValues.length).toBe(2)
    expect(screen.getByText('Forward EPS')).toBeInTheDocument()
    expect(screen.getByText('$6.89')).toBeInTheDocument()
    expect(screen.getByText('Next Qtr EPS')).toBeInTheDocument()
    expect(screen.getByText('$1.75')).toBeInTheDocument()
    expect(screen.getByText('Rev Growth')).toBeInTheDocument()
    expect(screen.getByText('5.2%')).toBeInTheDocument()
  })

  it('renders key metrics section', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText('Market Cap')).toBeInTheDocument()
    expect(screen.getByText('$2.8T')).toBeInTheDocument()
    expect(screen.getByText('P/E Ratio (TTM)')).toBeInTheDocument()
  })

  it('shows Watch button when not in watchlist', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText('Watch')).toBeInTheDocument()
  })

  it('shows Saved button when in watchlist', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={true} />)

    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('calls onAddToWatchlist when Watch is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<CompanyCard company={mockCompany} onAddToWatchlist={onAdd} isInWatchlist={false} />)

    await user.click(screen.getByText('Watch'))

    expect(onAdd).toHaveBeenCalledWith(mockCompany)
  })

  it('disables watchlist button when already saved', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={true} />)

    const savedButton = screen.getByText('Saved').closest('button')
    expect(savedButton).toBeDisabled()
  })

  it('handles minimal company data gracefully', () => {
    render(<CompanyCard company={mockMinimalCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText('XYZ')).toBeInTheDocument()
    expect(screen.getByText('XYZ Corp')).toBeInTheDocument()
    expect(screen.getByText('Unknown Sector')).toBeInTheDocument()
    // All N/A values
    const naValues = screen.getAllByText('N/A')
    expect(naValues.length).toBeGreaterThanOrEqual(4)
  })

  it('does not render valuation gauge when forwardPE is null', () => {
    render(<CompanyCard company={mockMinimalCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.queryByText('Valuation Score')).not.toBeInTheDocument()
  })

  it('shows disclaimer text', () => {
    render(<CompanyCard company={mockCompany} onAddToWatchlist={vi.fn()} isInWatchlist={false} />)

    expect(screen.getByText(/Data via Financial Modeling Prep/)).toBeInTheDocument()
  })
})
