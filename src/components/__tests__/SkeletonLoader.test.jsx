import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SkeletonLoader from '../SkeletonLoader'

describe('SkeletonLoader', () => {
  it('renders without crashing', () => {
    const { container } = render(<SkeletonLoader />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders skeleton placeholder elements', () => {
    const { container } = render(<SkeletonLoader />)
    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(4)
  })
})
