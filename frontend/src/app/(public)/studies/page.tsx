'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPublishedStudyPosts } from '@/shared/api/supabase'
import type { StudyPostWithAuthor } from '@/types/supabase'
import { APP_NAME } from '@/lib/config'
import { Card, Text, Title, Loading } from '@/shared/ui'

export default function StudiesPage() {
  const [posts, setPosts] = useState<StudyPostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = `Studies - ${APP_NAME}`
    fetchStudies()
  }, [])

  const fetchStudies = async () => {
    try {
      const data = await getPublishedStudyPosts()
      setPosts(data)
    } catch (error) {
      console.error('스터디 데이터 로딩 실패:', error)
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

  const getExcerpt = (content: string, maxLength: number = 150) => {
    // Markdown 제거하고 텍스트만 추출
    const text = content
      .replace(/[#*`\[\]()]/g, '')
      .replace(/\n/g, ' ')
      .trim()
    
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
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
          <Title className="text-white text-center mb-4">스터디</Title>
          <Text className="text-cyan-100 text-center text-lg">
            AIM 부원들의 스터디 활동과 학습 내용을 공유합니다
          </Text>
        </div>
      </div>

      {/* 스터디 포스트 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <Card className="p-8 text-center">
            <Text className="text-gray-400">등록된 스터디 포스트가 없습니다.</Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/studies/${post.id}`}
                className="block"
              >
                <Card className="p-6 hover:border-cyan-500 transition-colors h-full">
                  {post.cover_url && (
                    <div className="mb-4 aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={post.cover_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Title className="text-xl mb-2 line-clamp-2">{post.title}</Title>
                  <Text className="text-gray-400 text-sm mb-4">
                    {formatDate(post.created_at)}
                  </Text>
                  <Text className="text-gray-300 mb-4 line-clamp-3">
                    {getExcerpt(post.content_md)}
                  </Text>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tagItem) => (
                        <span
                          key={tagItem.tag.id}
                          className="px-2 py-1 bg-cyan-600/20 text-cyan-400 rounded text-xs"
                        >
                          #{tagItem.tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center mt-4 pt-4 border-t border-gray-700">
                    <Text className="text-gray-400 text-sm">
                      {post.author?.display_name || 'Unknown'}
                    </Text>
                  </div>
                </Card>
              </Link>
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

