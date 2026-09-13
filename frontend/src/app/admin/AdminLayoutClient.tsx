'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/shared/api/supabase/client'
import { Menu, X } from 'lucide-react'

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: { name: string | null }
}

const navigation = [
  { href: '/admin', label: '📊 대시보드' },
  { href: '/admin/about-management', label: 'ℹ️ 소개 관리' },
  { href: '/admin/member-management', label: '👥 멤버 관리' },
  { href: '/admin/activities-management', label: '🎯 활동 관리' },
  { href: '/admin/studies-management', label: '📚 스터디 관리' },
  { href: '/admin/news-management', label: '📰 뉴스 관리' },
  { href: '/admin/recruit-management', label: '📢 모집 공고 관리' },
]

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [supabase] = useState(createClient)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    if (!confirm('로그아웃하시겠습니까?')) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.')
      return
    }
    router.push('/login')
    router.refresh()
  }

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerRef.current?.querySelector<HTMLButtonElement>('button')?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
      if (event.key !== 'Tab') return
      const items = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button')
      if (!items?.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [mobileMenuOpen])

  const renderNavigation = () => navigation.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      onClick={() => setMobileMenuOpen(false)}
      aria-current={pathname === href ? 'page' : undefined}
      className={`block rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
        pathname === href ? 'bg-violet-500/10 text-violet-400' : 'text-white/70 hover:bg-white/5 hover:text-violet-400'
      }`}
    >
      {label}
    </Link>
  ))

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-white/5 bg-black/90 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-white/70 lg:hidden"
              aria-label="메뉴 열기"
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/admin" className="whitespace-nowrap text-lg font-bold text-white">🛠️ AIM 관리자</Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="hidden text-gray-300 hover:text-violet-400 sm:block">사이트 보기</Link>
            <span className="hidden max-w-40 truncate text-white md:block">{user.name}님</span>
            <button onClick={handleLogout} className="whitespace-nowrap rounded-xl border border-red-500/30 bg-red-500/20 px-3 py-2 text-red-400">로그아웃</button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div ref={drawerRef} id="admin-mobile-menu" role="dialog" aria-modal="true" aria-labelledby="admin-menu-title" className="relative flex h-full w-80 max-w-[85vw] flex-col border-r border-white/10 bg-black/95">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 id="admin-menu-title" className="text-lg font-medium text-white">관리 메뉴</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 text-white/70" aria-label="메뉴 닫기"><X className="h-6 w-6" /></button>
            </div>
            <nav aria-label="모바일 관리자 메뉴" className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
              {renderNavigation()}
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-gray-300">사이트 보기</Link>
            </nav>
          </div>
        </div>
      )}

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 overflow-y-auto border-r border-white/5 bg-black/50 px-2 py-5 lg:block">
        <h2 className="mb-3 px-3 text-lg font-medium text-white">관리 메뉴</h2>
        <nav aria-label="관리자 메뉴" className="space-y-1">{renderNavigation()}</nav>
      </aside>
      <main className="min-w-0 pt-16 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
