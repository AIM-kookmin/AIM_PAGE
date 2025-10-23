'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PublicNavigation() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    alert('로그아웃되었습니다.')
    router.push('/')
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
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="bg-pink-600 text-white px-3 py-2 rounded-md hover:bg-pink-700 text-sm"
                  >
                    🛠️ 관리자
                  </Link>
                )}
                <span className="text-white">
                  안녕하세요, {user.name}님
                  {user.role === 'admin' && (
                    <span className="ml-1 text-xs bg-pink-600 text-white px-2 py-1 rounded">
                      관리자
                    </span>
                  )}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 border border-gray-600"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-cyan-500 text-black px-4 py-2 rounded-md hover:bg-cyan-400 font-semibold">
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

