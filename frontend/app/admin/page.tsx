'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalMembers: number
  totalActivities: number
  totalStudies: number
  recentMembers: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalActivities: 0,
    totalStudies: 0,
    recentMembers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // 멤버 수 조회
      const membersResponse = await fetch('http://localhost:3001/api/members/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (membersResponse.ok) {
        const members = await membersResponse.json()
        setStats(prev => ({
          ...prev,
          totalMembers: members.length,
          recentMembers: members.slice(0, 5) // 최근 5명
        }))
      }
      
      // TODO: 활동, 스터디 수 조회 API 추가
      setStats(prev => ({
        ...prev,
        totalActivities: 0, // 임시
        totalStudies: 0 // 임시
      }))
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600">AIM 동아리 관리 시스템에 오신 것을 환영합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">총 멤버 수</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}명</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">총 활동 수</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalActivities}개</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">총 스터디 수</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudies}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 작업</h3>
          <div className="space-y-3">
            <Link
              href="/admin/member-management"
              className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <span className="text-blue-600 mr-3">👥</span>
                <div>
                  <p className="font-medium text-gray-900">멤버 관리</p>
                  <p className="text-sm text-gray-500">멤버 추가, 수정, 삭제</p>
                </div>
              </div>
            </Link>
            
            <Link
              href="/admin/activities"
              className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <span className="text-green-600 mr-3">🎯</span>
                <div>
                  <p className="font-medium text-gray-900">활동 관리</p>
                  <p className="text-sm text-gray-500">동아리 활동 관리</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/studies"
              className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <span className="text-purple-600 mr-3">📚</span>
                <div>
                  <p className="font-medium text-gray-900">스터디 관리</p>
                  <p className="text-sm text-gray-500">스터디 그룹 관리</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">최근 등록된 멤버</h3>
          {stats.recentMembers.length > 0 ? (
            <div className="space-y-3">
              {stats.recentMembers.map((member) => (
                <div key={member.id} className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {(member.profile?.displayName || member.name).charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {member.profile?.displayName || member.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {member.profile?.position || '부원'} • {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">등록된 멤버가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 시스템 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">시스템 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">버전</p>
            <p className="font-medium">AIM 관리 시스템 v1.0</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">마지막 업데이트</p>
            <p className="font-medium">{new Date().toLocaleDateString('ko-KR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
