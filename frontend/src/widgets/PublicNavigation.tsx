'use client'

import Link from 'next/link'
import { useAuth } from '@/shared/providers/AuthContext'

export default function PublicNavigation() {
  const { logout, isAuthenticated, isAdmin } = useAuth()

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      logout()
      alert('로그아웃되었습니다.')
    }
  }

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
    </nav>
  )
}

