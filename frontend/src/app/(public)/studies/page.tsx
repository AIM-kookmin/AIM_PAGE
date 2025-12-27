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
    const text = content
      .replace(/[#*`\[\]()]/g, '')
      .replace(/\n/g, ' ')
      .trim()
    
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black selection:bg-violet-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[80px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[80px] mix-blend-screen" />
      </div>

      <div className="relative pt-32 pb-16 md:pt-48 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              스터디
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            AIM 부원들의 깊이 있는 학습 기록.
            <br className="hidden md:block" />
            기술을 탐구하고 지식을 공유하는 공간입니다.
          </p>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {posts.length === 0 ? (
          <Card variant="glass" className="p-12 text-center max-w-2xl mx-auto">
            <Text className="text-gray-400 text-lg">등록된 스터디 포스트가 없습니다.</Text>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/studies/${post.id}`}
                className="block group"
              >
                <Card variant="glass" className="h-full p-0 overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] group-hover:border-violet-500/50">
                  <div className="relative aspect-video overflow-hidden bg-white/5">
                    {post.cover_url ? (
                      <img 
                        src={post.cover_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-4xl font-bold">
                        AIM
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      {post.tags?.map((tagItem) => (
                        <span
                          key={tagItem.tag.id}
                          className="inline-flex items-center rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20"
                        >
                          #{tagItem.tag.name}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-violet-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {getExcerpt(post.content_md)}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                      <span className="text-sm font-medium text-gray-300">
                        {post.author?.display_name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="relative border-t border-white/10 bg-black/50 backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2024 AIM (AI Monsters). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
