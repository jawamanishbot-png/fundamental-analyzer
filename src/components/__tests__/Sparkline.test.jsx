import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Sparkline from '../Sparkline'

describe('Sparkline', () => {
  const upData = [
    { date: '2026-01-01', close: 100 },
    { date: '2026-01-02', close: 102 },
    { date: '2026-01-03', close: 105 },
    { date: '2026-01-04', close: 103 },
    { date: '2026-01-05', close: 110 },
  ]

  const downData = [
    { date: '2026-01-01', close: 110 },
    { date: '2026-01-02', close: 108 },
    { date: '2026-01-03', close: 105 },
    { date: '2026-01-04', close: 103 },
    { date: '2026-01-05', close: 100 },
  ]

  it('renders an SVG element', () => {
    const { container } = render(<Sparkline data={upData} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders a line path and an area path', () => {
    const { container } = render(<Sparkline data={upData} />)
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(2) // area + line
  })

  it('uses green stroke for upward trend', () => {
    const { container } = render(<Sparkline data={upData} />)
    const linePath = container.querySelectorAll('path')[1]
    expect(linePath.getAttribute('stroke')).toBe('#34d399')
  })

  it('uses red stroke for downward trend', () => {
    const { container } = render(<Sparkline data={downData} />)
    const linePath = container.querySelectorAll('path')[1]
    expect(linePath.getAttribute('stroke')).toBe('#f87171')
  })

  it('returns null for empty data', () => {
    const { container } = render(<Sparkline data={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null for single data point', () => {
    const { container } = render(<Sparkline data={[{ close: 100 }]} />)
    expect(container.firstChild).toBeNull()
  })

  it('accepts custom width and height', () => {
    const { container } = render(<Sparkline data={upData} width={300} height={80} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('300')
    expect(svg.getAttribute('height')).toBe('80')
  })
})
