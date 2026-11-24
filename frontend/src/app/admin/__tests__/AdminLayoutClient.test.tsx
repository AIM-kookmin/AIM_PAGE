import { fireEvent, render, screen, within } from '@testing-library/react'
import AdminLayoutClient from '../AdminLayoutClient'

it('offers the same management routes on mobile and desktop, including news', () => {
  render(<AdminLayoutClient user={{ name: '운영진' }}><p>대시보드 내용</p></AdminLayoutClient>)
  const desktop = screen.getByRole('navigation', { name: '관리자 메뉴' })
  const desktopPaths = within(desktop).getAllByRole('link').map(link => link.getAttribute('href'))
  fireEvent.click(screen.getByRole('button', { name: '메뉴 열기' }))
  const mobile = screen.getByRole('navigation', { name: '모바일 관리자 메뉴' })
  const mobilePaths = within(mobile).getAllByRole('link').map(link => link.getAttribute('href'))
  expect(desktopPaths).toContain('/admin/news-management')
  expect(mobilePaths).toEqual([...desktopPaths, '/'])
  fireEvent.click(within(mobile).getByRole('link', { name: /뉴스 관리/ }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('')
})

it('closes the drawer with Escape and returns focus to its opener', () => {
  render(<AdminLayoutClient user={{ name: null }}>content</AdminLayoutClient>)
  const opener = screen.getByRole('button', { name: '메뉴 열기' })
  opener.focus()
  fireEvent.click(opener)
  expect(screen.getByRole('button', { name: '메뉴 닫기' })).toHaveFocus()
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})
