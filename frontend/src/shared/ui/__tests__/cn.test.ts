import { cn } from '../cn'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('text-white', 'bg-black')
    expect(result).toBe('text-white bg-black')
  })

  it('handles conditional classes', () => {
    const result = cn('text-white', false && 'hidden', 'bg-black')
    expect(result).toBe('text-white bg-black')
  })

  it('overrides conflicting Tailwind classes', () => {
    const result = cn('p-4', 'p-8')
    expect(result).toBe('p-8')
  })

  it('handles arrays of classes', () => {
    const result = cn(['text-white', 'bg-black'], 'rounded')
    expect(result).toBe('text-white bg-black rounded')
  })

  it('handles empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles undefined and null values', () => {
    const result = cn('text-white', undefined, null, 'bg-black')
    expect(result).toBe('text-white bg-black')
  })

  it('merges complex Tailwind utilities', () => {
    const result = cn('hover:text-white', 'hover:text-black')
    expect(result).toBe('hover:text-black')
  })
})
