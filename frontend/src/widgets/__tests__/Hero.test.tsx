import { render, screen } from '@testing-library/react'
import Hero from '../Hero'

describe('Hero Component', () => {
  it('renders with default badge text', () => {
    render(<Hero />)

    expect(screen.getByText('국민대학교 AI 동아리')).toBeInTheDocument()
  })

  it('renders with custom badge', () => {
    const customData = {
      badge: 'Custom Badge',
      title: 'TEST',
      subtitle: 'Test Subtitle',
      description: 'Custom description text',
    }

    render(<Hero data={customData} />)

    expect(screen.getByText('Custom Badge')).toBeInTheDocument()
    expect(screen.getByText('Custom description text')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Hero />)

    const aboutLink = screen.getByRole('link', { name: /동아리 알아보기/i })
    const recruitLink = screen.getByRole('link', { name: /모집 공고/i })

    expect(aboutLink).toHaveAttribute('href', '/about')
    expect(recruitLink).toHaveAttribute('href', '/recruit')
  })

  it('renders particle background', () => {
    render(<Hero />)

    expect(screen.getByTestId('particle-background')).toBeInTheDocument()
  })
})
