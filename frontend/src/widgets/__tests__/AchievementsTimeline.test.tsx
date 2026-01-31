import { render, screen } from '@testing-library/react'
import AchievementsTimeline from '../AchievementsTimeline'

describe('AchievementsTimeline Component', () => {
  it('renders section title', () => {
    render(<AchievementsTimeline />)

    expect(screen.getByText('Track Record')).toBeInTheDocument()
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })

  it('shows empty state when no achievements', () => {
    render(<AchievementsTimeline achievements={[]} />)

    expect(screen.getByText('성과 정보가 없습니다.')).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<AchievementsTimeline />)

    expect(screen.getByText(/AI Monster들이 함께 만들어온 성과와 여정/)).toBeInTheDocument()
  })

  it.skip('renders with achievements without errors', () => {
    const mockAchievements = [
      {
        id: '1',
        year: 2024,
        title: 'Test Award 2024',
        description: 'Award description',
        category: 'award' as const,
      },
    ]

    const { container } = render(<AchievementsTimeline achievements={mockAchievements} />)

    // Just verify component renders without errors
    expect(container).toBeInTheDocument()
  })
})
