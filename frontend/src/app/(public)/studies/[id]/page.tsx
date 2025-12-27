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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-4xl w-full px-4">
          <Card variant="glass" className="p-12 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">포스트를 찾을 수 없습니다</h1>
            <Link href="/studies" className="text-violet-400 hover:text-violet-300 hover:underline transition-colors">
              스터디 목록으로 돌아가기
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black selection:bg-violet-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[80px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[80px] mix-blend-screen" />
      </div>

      <div className="relative pt-32 pb-12 md:pt-48 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/studies" 
            className="inline-flex items-center text-sm text-gray-400 hover:text-violet-400 transition-colors mb-8"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로 돌아가기
          </Link>
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tagItem) => (
                <span
                  key={tagItem.tag.id}
                  className="inline-flex items-center rounded-full bg-violet-500/10 px-3 py-1 text-sm font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20"
                >
                  #{tagItem.tag.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-lg">
                  {post.author?.display_name?.[0] || 'A'}
                </div>
                <div>
                  <div className="text-white font-medium">
                    {post.author?.display_name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    AIM Member
                  </div>
                </div>
              </div>
              <time className="text-sm text-gray-500 font-mono">
                {formatDate(post.created_at)}
              </time>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {post.cover_url && (
          <div className="mb-12 aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <img 
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Card variant="glass" className="p-8 md:p-12">
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:text-white prose-a:text-violet-400 prose-a:no-underline hover:prose-a:text-violet-300 prose-strong:text-white prose-code:text-violet-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-blockquote:border-l-violet-500 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-li:text-gray-300 prose-p:text-gray-300 prose-img:rounded-xl">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mt-12 mb-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mt-10 mb-5 pb-2 border-b border-white/10">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold mt-8 mb-4">{children}</h3>,
                a: ({ href, children }) => (
                  <a href={href} className="text-violet-400 hover:text-violet-300 transition-colors" target="_blank" rel="noopener noreferrer">
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
