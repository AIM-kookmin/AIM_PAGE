'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, User } from 'lucide-react'
import type { StudyPostWithAuthor } from '@/types/supabase'

gsap.registerPlugin(ScrollTrigger)

interface StudiesClientProps {
  posts: StudyPostWithAuthor[]
}

export default function StudiesClient({ posts }: StudiesClientProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      )

      if (gridRef.current) {
        gsap.fromTo(gridRef.current,
          { y: 100, opacity: 0 },
          {
            y: 0, opacity: 1, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top bottom', end: 'top 40%', scrub: true }
          }
        )
      }
    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={mainRef} className="min-h-screen bg-black overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            transform: 'translate(20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            transform: 'translate(-20%, 30%)',
          }}
        />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section ref={heroRef} className="min-h-[50vh] flex items-center justify-center pt-20 px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Studies
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              AIM 부원들의 깊이 있는 학습 기록
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-8 rounded-full" />
          </div>
        </section>

        {/* Studies Grid */}
        <section ref={gridRef} className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            {posts.length === 0 ? (
              <div className="text-center p-12 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-gray-500 text-lg">등록된 스터디 포스트가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/studies/${post.id}`}
                    className="group"
                  >
                    <div className="h-full rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden">
                      {/* Cover Image */}
                      <div className="aspect-video bg-white/[0.02] overflow-hidden">
                        {post.cover_url ? (
                          <img
                            src={post.cover_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-violet-500/20 text-4xl font-bold">AIM</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tagItem) => (
                              <span
                                key={tagItem.tag.id}
                                className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs"
                              >
                                #{tagItem.tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-violet-300 transition-colors">
                          {post.title}
                        </h3>

                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {getExcerpt(post.content_md)}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="flex items-center gap-2 text-sm text-gray-400">
                            <User className="w-3 h-3" />
                            {post.author?.display_name || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">&copy; 2025 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
