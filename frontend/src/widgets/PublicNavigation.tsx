'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/shared/providers/AuthContext'

export default function PublicNavigation() {
  const { logout, isAuthenticated, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    if (confirm('로그아웃하시겠습니까?')) {
      await logout()
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [mobileMenuOpen])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/images/aim_logo.png" 
                alt="AIM 로고" 
                className="h-8 w-auto object-contain"
              />
              <span className="text-xl font-bold text-white">AIM</span>
              <span className="text-sm text-gray-400 ml-1">AI Monsters</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/about" className="text-white/70 hover:text-violet-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">
                소개
              </Link>
              <Link href="/members" className="text-white/70 hover:text-violet-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">
                부원
              </Link>
              <Link href="/activities" className="text-white/70 hover:text-violet-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">
                활동
              </Link>
              <Link href="/studies" className="text-white/70 hover:text-violet-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">
                스터디
              </Link>
              <Link href="/recruit" className="text-white/70 hover:text-violet-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]">
                모집
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-3 text-white/70 hover:text-white transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="w-6 h-6" />
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="bg-secondary-500/20 text-secondary-400 border border-secondary-500/30 px-3 py-2 rounded-lg hover:bg-secondary-500/30 hover:shadow-glow-secondary text-sm transition-all duration-300"
                  >
                    🛠️ 관리자
                  </Link>
                )}
                <Link 
                  href="/profile"
                  className="text-white/70 hover:text-violet-400 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(139,92,246,0.4)] "
                >
                  <span className="group-hover:underline">
                    프로필 수정
                  </span>
                  {isAdmin && (
                    <span className="ml-1 text-xs bg-secondary-500/20 text-secondary-400 border border-secondary-500/30 px-2 py-0.5 rounded-md">
                      관리자
                    </span>
                  )}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-white/5 text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-400 hover:shadow-glow-primary transition-all duration-300">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-l border-white/10 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <img
                  src="/images/aim_logo.png"
                  alt="AIM 로고"
                  className="h-6 w-auto object-contain"
                />
                <span className="text-lg font-bold text-white">AIM</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-3 text-white/70 hover:text-white transition-colors"
                aria-label="메뉴 닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-6 space-y-1">
              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-white/70 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                소개
              </Link>
              <Link
                href="/members"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-white/70 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                부원
              </Link>
              <Link
                href="/activities"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-white/70 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                활동
              </Link>
              <Link
                href="/studies"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-white/70 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                스터디
              </Link>
              <Link
                href="/recruit"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-white/70 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-all duration-300"
              >
                모집
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="p-6 border-t border-white/10 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-white/70 hover:text-violet-400 hover:bg-white/5 rounded-lg transition-all duration-300"
                  >
                    프로필 수정
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={closeMobileMenu}
                      className="block bg-secondary-500/20 text-secondary-400 border border-secondary-500/30 px-4 py-3 rounded-lg hover:bg-secondary-500/30 text-center transition-all duration-300"
                    >
                      🛠️ 관리자
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      closeMobileMenu()
                      handleLogout()
                    }}
                    className="w-full bg-white/5 text-white px-4 py-3 rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="block bg-primary-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary-400 text-center transition-all duration-300"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

