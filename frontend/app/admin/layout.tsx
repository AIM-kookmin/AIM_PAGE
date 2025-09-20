'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAuth = () => {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')

      if (!storedUser || !token) {
        router.push('/login')
        return
      }

      const userData = JSON.parse(storedUser)
      if (userData.role !== 'admin') {
        alert('관리자 권한이 필요합니다.')
        router.push('/')
        return
      }

      setUser(userData)
      setLoading(false)
    }

    checkAdminAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 관리자 네비게이션 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                🛠️ AIM 관리자
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  대시보드
                </Link>
                <Link 
                  href="/admin/member-management" 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  멤버 관리
                </Link>
                <Link 
                  href="/admin/activities" 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  활동 관리
                </Link>
                <Link 
                  href="/admin/studies" 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  스터디 관리
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-700"
                target="_blank"
              >
                🌐 사이트 보기
              </Link>
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">
                  {user.name}님
                  <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    관리자
                  </span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 사이드바 (모바일에서는 숨김) */}
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-medium text-gray-900">관리 메뉴</h2>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link
                  href="/admin"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  📊 대시보드
                </Link>
                <Link
                  href="/admin/member-management"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  👥 멤버 관리
                </Link>
                <Link
                  href="/admin/activities"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  🎯 활동 관리
                </Link>
                <Link
                  href="/admin/studies"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  📚 스터디 관리
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
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
