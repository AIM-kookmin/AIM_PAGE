import { render, screen } from '@testing-library/react'
import ActivitiesSection from '../ActivitiesSection'

describe('ActivitiesSection Component', () => {
  const mockActivities = [
    {
      id: '1',
      title: 'Test Activity 1',
      description: 'Description 1',
      icon: 'study',
      order: 1,
    },
    {
      id: '2',
      title: 'Test Activity 2',
      description: 'Description 2',
      icon: 'project',
      order: 2,
    },
  ]

  it('renders section title', () => {
    render(<ActivitiesSection />)

    expect(screen.getByText('What We Do')).toBeInTheDocument()
    expect(screen.getByText('Activities')).toBeInTheDocument()
  })

  it('renders activities from props', () => {
    render(<ActivitiesSection activities={mockActivities} />)

    expect(screen.getByText('Test Activity 1')).toBeInTheDocument()
    expect(screen.getByText('Test Activity 2')).toBeInTheDocument()
  })

  it('shows empty state when no activities', () => {
    render(<ActivitiesSection activities={[]} />)

    expect(screen.getByText('활동 정보가 없습니다.')).toBeInTheDocument()
  })

  it('renders link to activities page', () => {
    render(<ActivitiesSection />)

    const link = screen.getByRole('link', { name: /모든 활동 보기/i })
    expect(link).toHaveAttribute('href', '/activities')
  })
})
