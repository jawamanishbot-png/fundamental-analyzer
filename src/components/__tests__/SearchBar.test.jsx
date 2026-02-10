import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  it('renders input and submit button', () => {
    render(<SearchBar onSearch={vi.fn()} loading={false} />)

    expect(screen.getByPlaceholderText('Search ticker symbol...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Analyze' })).toBeInTheDocument()
  })

  it('uppercases input as you type', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    await user.type(input, 'aapl')

    expect(input).toHaveValue('AAPL')
  })

  it('calls onSearch with ticker on submit', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    await user.type(input, 'MSFT')
    await user.click(screen.getByRole('button', { name: 'Analyze' }))

    expect(onSearch).toHaveBeenCalledWith('MSFT')
  })

  it('clears input after submitting', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    await user.type(input, 'TSLA')
    await user.click(screen.getByRole('button', { name: 'Analyze' }))

    expect(input).toHaveValue('')
  })

  it('does not submit when input is empty', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)

    const button = screen.getByRole('button', { name: 'Analyze' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('disables input and buttons when loading', () => {
    render(<SearchBar onSearch={vi.fn()} loading={true} />)

    expect(screen.getByPlaceholderText('Search ticker symbol...')).toBeDisabled()
  })

  it('shows spinner instead of Analyze text when loading', () => {
    render(<SearchBar onSearch={vi.fn()} loading={true} />)

    expect(screen.queryByText('Analyze')).not.toBeInTheDocument()
  })

  it('renders popular ticker buttons', () => {
    render(<SearchBar onSearch={vi.fn()} loading={false} />)

    expect(screen.getByText('AAPL')).toBeInTheDocument()
    expect(screen.getByText('MSFT')).toBeInTheDocument()
    expect(screen.getByText('GOOGL')).toBeInTheDocument()
    expect(screen.getByText('TSLA')).toBeInTheDocument()
  })

  it('calls onSearch when a popular ticker is clicked', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} loading={false} />)

    await user.click(screen.getByText('AAPL'))

    expect(onSearch).toHaveBeenCalledWith('AAPL')
  })

  it('enforces max length of 5 characters', () => {
    render(<SearchBar onSearch={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    expect(input).toHaveAttribute('maxLength', '5')
  })

  it('shows clear button when input has text', async () => {
    const user = userEvent.setup()
    render(<SearchBar onSearch={vi.fn()} loading={false} />)

    const input = screen.getByPlaceholderText('Search ticker symbol...')
    // No clear button when empty
    expect(screen.queryAllByRole('button').filter(b => b.getAttribute('type') === 'button' && !b.textContent.match(/AAPL|MSFT|GOOGL|TSLA|Popular/))).toHaveLength(0)

    await user.type(input, 'A')

    // Clear button should now be present (type="button", not the submit or popular buttons)
    const buttons = screen.getAllByRole('button')
    const clearButton = buttons.find(b => b.getAttribute('type') === 'button' && !b.textContent.match(/AAPL|MSFT|GOOGL|TSLA/))
    expect(clearButton).toBeInTheDocument()
  })
})
