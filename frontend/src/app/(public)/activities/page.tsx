'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { APP_NAME } from '@/lib/config'
import { Card, Text, Title, Loading } from '@/shared/ui'
import { getActivities } from '@/shared/api/supabase'
import type { Activity } from '@/types/supabase'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = `Activities - ${APP_NAME}`
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const data = await getActivities()
      setActivities(data)
    } catch (error) {
      console.error('활동 데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-cyan-600 to-pink-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Title className="text-white text-center mb-4">동아리 활동</Title>
          <Text className="text-cyan-100 text-center text-lg">
            AIM의 다양한 활동과 이벤트를 확인해보세요
          </Text>
        </div>
      </div>

      {/* 활동 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activities.length === 0 ? (
          <Card className="p-8 text-center">
            <Text className="text-gray-400">등록된 활동이 없습니다.</Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity) => (
              <Card key={activity.id} className="p-6 hover:border-cyan-500 transition-colors">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-sm">
                    {activity.category}
                  </span>
                </div>
                <Title className="text-xl mb-2">{activity.title}</Title>
                <Text className="text-gray-400 text-sm mb-4">
                  {formatDate(activity.date)}
                </Text>
                {activity.description && (
                  <Text className="text-gray-300 mb-4 line-clamp-3">
                    {activity.description}
                  </Text>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 푸터 */}
      <footer className="bg-black border-t border-gray-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">&copy; 2024 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

