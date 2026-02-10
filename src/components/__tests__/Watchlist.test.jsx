import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Watchlist from '../Watchlist'
import { mockCompany, mockUndervaluedCompany } from '../../test/fixtures'

describe('Watchlist', () => {
  it('shows empty state when no companies', () => {
    render(<Watchlist companies={[]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('No companies saved yet')).toBeInTheDocument()
    expect(screen.getByText(/Search for a company and tap Watch/)).toBeInTheDocument()
  })

  it('renders company cards when companies exist', () => {
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
  })

  it('shows correct count header (singular)', () => {
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('1 Company')).toBeInTheDocument()
  })

  it('shows correct count header (plural)', () => {
    render(<Watchlist companies={[mockCompany, mockUndervaluedCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('2 Companies')).toBeInTheDocument()
  })

  it('displays current price for each company', () => {
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('$195.50')).toBeInTheDocument()
  })

  it('displays upside percentage', () => {
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    // Upside = ((210 - 195.5) / 195.5) * 100 = 7.4%
    expect(screen.getByText(/\+7\.4%/)).toBeInTheDocument()
  })

  it('displays mini metrics row', () => {
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('28.3')).toBeInTheDocument() // Fwd P/E
    expect(screen.getByText('$210')).toBeInTheDocument() // Target
    expect(screen.getByText('+5.2%')).toBeInTheDocument() // Rev growth
  })

  it('shows valuation badge', () => {
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('Over')).toBeInTheDocument() // P/E > 25
  })

  it('shows Under badge for undervalued company', () => {
    render(<Watchlist companies={[mockUndervaluedCompany]} onRemove={vi.fn()} onSelect={vi.fn()} />)

    expect(screen.getByText('Under')).toBeInTheDocument() // P/E < 15
  })

  it('calls onRemove with symbol when remove button is clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<Watchlist companies={[mockCompany]} onRemove={onRemove} onSelect={vi.fn()} />)

    const removeButton = screen.getByTitle('Remove from watchlist')
    await user.click(removeButton)

    expect(onRemove).toHaveBeenCalledWith('AAPL')
  })

  it('calls onSelect with company when card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={onSelect} />)

    // Click on the company name (which is inside the clickable card)
    await user.click(screen.getByText('Apple Inc.'))

    expect(onSelect).toHaveBeenCalledWith(mockCompany)
  })

  it('does not call onSelect when remove is clicked (stopPropagation)', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<Watchlist companies={[mockCompany]} onRemove={vi.fn()} onSelect={onSelect} />)

    await user.click(screen.getByTitle('Remove from watchlist'))

    expect(onSelect).not.toHaveBeenCalled()
  })
})
