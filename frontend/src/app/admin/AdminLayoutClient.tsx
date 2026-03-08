'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/shared/api/supabase/client'
import { Menu, X } from 'lucide-react'

interface AdminLayoutClientProps {
  children: React.ReactNode
  user: {
    name: string | null
  }
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const router = useRouter()
  const supabaseRef = useRef(createClient())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    if (confirm('로그아웃하시겠습니까?')) {
      try {
        await supabaseRef.current.auth.signOut()
      } catch (error) {
        console.error('Sign out error:', error)
      }
      router.push('/login')
      router.refresh()
    }
  }

  // ESC key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen])

  return (
    <div className="min-h-screen bg-black">

      {/* 관리자 네비게이션 */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-3 text-white/70 hover:text-violet-400 transition-colors"
                aria-label="메뉴 열기"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/admin" className="text-xl font-bold text-white">
                🛠️ <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">AIM</span> 관리자
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/admin" 
                  className="text-white/70 hover:text-violet-400 font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                >
                  대시보드
                </Link>
                <Link 
                  href="/admin/member-management" 
                  className="text-white/70 hover:text-violet-400 font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                >
                  멤버 관리
                </Link>
                <Link
                  href="/admin/activities-management"
                  className="text-white/70 hover:text-violet-400 font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                >
                  활동 관리
                </Link>
                <Link
                  href="/admin/studies-management"
                  className="text-white/70 hover:text-violet-400 font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                >
                  스터디 관리
                </Link>
                <Link
                  href="/admin/news-management"
                  className="text-white/70 hover:text-violet-400 font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                >
                  뉴스 관리
                </Link>
                <Link
                  href="/admin/recruit-management"
                  className="text-white/70 hover:text-violet-400 font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                >
                  모집 공고 관리
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-violet-400 transition-colors"
                target="_blank"
              >
                🌐 사이트 보기
              </Link>
              <div className="flex items-center space-x-3">
                <span className="text-white">
                  {user.name}님
                  <span className="ml-1 text-xs bg-secondary-500/20 text-secondary-400 border border-secondary-500/30 px-2 py-0.5 rounded-md">
                    관리자
                  </span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-all duration-300"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-in drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 lg:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-medium text-white">관리 메뉴</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-white/70 hover:text-violet-400 transition-colors"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  📊 대시보드
                </Link>
                <Link
                  href="/admin/about-management"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  ℹ️ 소개 관리
                </Link>
                <Link
                  href="/admin/member-management"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  👥 멤버 관리
                </Link>
                <Link
                  href="/admin/activities-management"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  🎯 활동 관리
                </Link>
                <Link
                  href="/admin/studies-management"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  📚 스터디 관리
                </Link>
                <Link
                  href="/admin/recruit-management"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  📢 모집 공고 관리
                </Link>
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* 사이드바 (모바일에서는 숨김) */}
      <div className="flex pt-16 min-h-screen">
        <aside className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:left-0 lg:top-16 lg:bottom-0">
          <div className="flex flex-col w-64 h-full">
            <div className="flex flex-col flex-grow bg-black/50 backdrop-blur-lg border-r border-white/5 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-2">
                <h2 className="text-lg font-medium text-white">관리 메뉴</h2>
              </div>
              <nav className="mt-3 flex-1 px-2 space-y-1">
                <Link
                  href="/admin"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  📊 대시보드
                </Link>
                <Link
                  href="/admin/about-management"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  ℹ️ 소개 관리
                </Link>
                <Link
                  href="/admin/member-management"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  👥 멤버 관리
                </Link>
                <Link
                  href="/admin/activities-management"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  🎯 활동 관리
                </Link>
                <Link
                  href="/admin/studies-management"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  📚 스터디 관리
                </Link>
                <Link
                  href="/admin/news-management"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  📰 뉴스 관리
                </Link>
                <Link
                  href="/admin/recruit-management"
                  className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-white/70 hover:bg-white/5 hover:text-violet-400 transition-all duration-300"
                >
                  📢 모집 공고 관리
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 lg:ml-64 bg-black">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
