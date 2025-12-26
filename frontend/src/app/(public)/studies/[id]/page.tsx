'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getStudyPostById } from '@/shared/api/supabase'
import type { StudyPostWithAuthor } from '@/types/supabase'
import { APP_NAME } from '@/lib/config'
import { Card, Text, Title, Loading } from '@/shared/ui'
import ReactMarkdown from 'react-markdown'

export default function StudyPostPage() {
  const params = useParams()
  const postId = params?.id as string
  const [post, setPost] = useState<StudyPostWithAuthor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId])

  const fetchPost = async () => {
    try {
      const data = await getStudyPostById(postId)
      if (data) {
        setPost(data)
        document.title = `${data.title} - ${APP_NAME}`
      }
    } catch (error) {
      console.error('스터디 포스트 로딩 실패:', error)
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

  if (!post) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 text-center">
            <Title className="mb-4">포스트를 찾을 수 없습니다</Title>
            <Link href="/studies" className="text-cyan-400 hover:underline">
              스터디 목록으로 돌아가기
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-cyan-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/studies" className="text-cyan-100 hover:text-white mb-4 inline-block">
            ← 스터디 목록으로
          </Link>
          <Title className="text-white mb-4">{post.title}</Title>
          <div className="flex items-center justify-between text-cyan-100">
            <Text>
              {post.author?.display_name || 'Unknown'}
            </Text>
            <Text>{formatDate(post.created_at)}</Text>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {post.cover_url && (
          <div className="mb-8 aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <img 
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tagItem) => (
              <span
                key={tagItem.tag.id}
                className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-sm"
              >
                #{tagItem.tag.name}
              </span>
            ))}
          </div>
        )}

        <Card className="p-8">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold text-white mb-3 mt-6">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold text-white mb-2 mt-4">{children}</h3>,
                p: ({ children }) => <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>,
                code: ({ children }) => (
                  <code className="bg-gray-800 text-cyan-400 px-2 py-1 rounded text-sm">
                    {children}
                  </code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-gray-300">{children}</li>,
                a: ({ href, children }) => (
                  <a href={href} className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {post.content_md}
            </ReactMarkdown>
          </div>
        </Card>
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
