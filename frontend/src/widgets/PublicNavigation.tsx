'use client'

import Link from 'next/link'
import { useAuth } from '@/app/providers/AuthContext'

export default function PublicNavigation() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      logout()
      alert('로그아웃되었습니다.')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-800 backdrop-blur-sm bg-opacity-95">
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
            <Link href="/about" className="text-gray-300 hover:text-cyan-400 transition-colors">
              소개
            </Link>
            <Link href="/members" className="text-gray-300 hover:text-cyan-400 transition-colors">
              부원
            </Link>
            <Link href="/activities" className="text-gray-300 hover:text-cyan-400 transition-colors">
              활동
            </Link>
            <Link href="/studies" className="text-gray-300 hover:text-cyan-400 transition-colors">
              스터디
            </Link>
            <Link href="/recruit" className="text-gray-300 hover:text-cyan-400 transition-colors">
              모집
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className="bg-pink-600 text-white px-3 py-2 rounded-md hover:bg-pink-700 text-sm transition-colors"
                  >
                    🛠️ 관리자
                  </Link>
                )}
                <Link 
                  href="/profile"
                  className="text-gray-300 hover:text-cyan-400 transition-colors "
                >
                  <span className="group-hover:underline">
                    프로필 수정
                  </span>
                  {isAdmin && (
                    <span className="ml-1 text-xs bg-pink-600 text-white px-2 py-1 rounded">
                      관리자
                    </span>
                  )}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 border border-gray-600 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-cyan-500 text-black px-4 py-2 rounded-md hover:bg-cyan-400 font-semibold transition-colors">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

