'use client'

import { memo, useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Github, Linkedin, Instagram, Globe, ChevronRight } from 'lucide-react'
import type { MemberProfile } from '@/types/supabase'

gsap.registerPlugin(ScrollTrigger)

interface MembersClientProps {
  executives: MemberProfile[]
  regularMembers: MemberProfile[]
}

const MemberCard = memo(function MemberCard({ member }: { member: MemberProfile }) {
  return (
    <div className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.15)] transition-all duration-300">
      <div className="flex gap-5 items-start">
        {/* 왼쪽: 프로필 이미지 */}
        <div className="shrink-0 w-20 h-20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-full flex items-center justify-center group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300">
          <span className="text-violet-300 text-2xl font-bold">
            {member.display_name.charAt(0)}
          </span>
        </div>

        {/* 오른쪽: 정보 */}
        <div className="min-w-0 flex-1">
          {/* 이름 */}
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors truncate">
            {member.display_name}
          </h3>

          {/* 기수, 직책 */}
          <div className="flex items-center gap-2 text-sm mb-2 flex-wrap">
            {member.generation && (
              <span className="text-violet-400 font-medium">{member.generation}기</span>
            )}
            {member.generation && member.position && (
              <span className="text-gray-600">·</span>
            )}
            {member.position && (
              <span className="text-violet-400/80">{member.position}</span>
            )}
          </div>

          {/* 학부 */}
          {member.department && (
            <p className="text-gray-500 text-sm mb-2 truncate">{member.department}</p>
          )}

          {/* 자기소개 */}
          {member.bio && (
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3">
              {member.bio}
            </p>
          )}

          {/* 연락처 */}
          {(member.links && typeof member.links === 'object' &&
            (('github' in member.links && member.links.github) ||
             ('linkedin' in member.links && member.links.linkedin) ||
             ('instagram' in member.links && member.links.instagram) ||
             ('blog' in member.links && member.links.blog))) && (
            <div className="flex gap-2">
              {member.links && typeof member.links === 'object' && 'github' in member.links && member.links.github && (
                <a
                  href={`https://github.com/${member.links.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-violet-400 hover:border-violet-500/30 transition-all duration-200"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              )}
              {member.links && typeof member.links === 'object' && 'linkedin' in member.links && member.links.linkedin && (
                <a
                  href={`https://linkedin.com/in/${member.links.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-violet-400 hover:border-violet-500/30 transition-all duration-200"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
              {member.links && typeof member.links === 'object' && 'instagram' in member.links && member.links.instagram && (
                <a
                  href={`https://instagram.com/${member.links.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-violet-400 hover:border-violet-500/30 transition-all duration-200"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              )}
              {member.links && typeof member.links === 'object' && 'blog' in member.links && member.links.blog && typeof member.links.blog === 'string' && (
                <a
                  href={member.links.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-gray-500 hover:text-violet-400 hover:border-violet-500/30 transition-all duration-200"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

function MembersClient({ executives, regularMembers }: MembersClientProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const executivesRef = useRef<HTMLDivElement>(null)
  const membersRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )

      if (executivesRef.current) {
        gsap.fromTo(executivesRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: executivesRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        )
      }

      if (membersRef.current) {
        gsap.fromTo(membersRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: membersRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        )
      }

      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
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
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            transform: 'translate(-30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            transform: 'translate(30%, 30%)',
          }}
        />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section ref={heroRef} className="min-h-[50vh] flex items-center justify-center pt-20 px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Members
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              AIM 동아리의 멋진 부원들을 소개합니다
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-8 rounded-full" />
          </div>
        </section>

        {/* 데이터가 없을 때 */}
        {executives.length === 0 && regularMembers.length === 0 && (
          <section className="py-24 px-4">
            <div className="max-w-2xl mx-auto text-center p-12 rounded-2xl bg-white/[0.02] border border-white/5">
              <p className="text-gray-500 text-lg">등록된 부원이 없습니다.</p>
            </div>
          </section>
        )}

        {/* 부원 목록 */}
        {(executives.length > 0 || regularMembers.length > 0) && (
          <>
            {/* 운영진 */}
            {executives.length > 0 && (
              <section ref={executivesRef} className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                  <h2 className="text-3xl font-bold text-white text-center mb-12">운영진</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {executives.map(member => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 일반 부원 */}
            {regularMembers.length > 0 && (
              <section ref={membersRef} className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                  <h2 className="text-3xl font-bold text-white text-center mb-12">부원</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {regularMembers.map(member => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* CTA */}
            <section ref={ctaRef} className="py-24 px-4">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    AI Monsters
                  </span>
                  에 합류하세요
                </h2>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                  AI와 머신러닝에 관심이 있다면 언제든 환영합니다
                </p>
                <Link
                  href="/recruit"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-violet-500 hover:bg-violet-400 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
                >
                  모집 공고 보기
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </section>
          </>
        )}
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

MembersClient.displayName = 'MembersClient'

export default memo(MembersClient)
