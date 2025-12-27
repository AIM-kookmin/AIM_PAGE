'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPublicMembers } from '@/shared/api/supabase'
import type { MemberProfile } from '@/types/supabase'
import { APP_NAME } from '@/lib/config'

export default function MembersPage() {
  const [members, setMembers] = useState<MemberProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = `Members - ${APP_NAME}`
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const data = await getPublicMembers()
      setMembers(data)
    } catch (error) {
      console.error('멤버 데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 직책별로 멤버 분류 - 회장, 부회장, 운영진은 운영진으로, 나머지는 부원으로
  const executives = members.filter(member => {
    const position = member.position?.toLowerCase() || ''
    return position === '회장' || 
           position === '부회장' || 
           position === '운영진'
  })
  
  const regularMembers = members.filter(member => {
    const position = member.position?.toLowerCase() || ''
    return position !== '회장' && 
           position !== '부회장' && 
           position !== '운영진'
  })

  // 운영진 정렬: 회장 → 부회장 → 나머지(기수 먼저, 동기수 시 가나다)
  const sortedExecutives = executives.sort((a, b) => {
    const positionA = a.position?.toLowerCase() || ''
    const positionB = b.position?.toLowerCase() || ''
    
    // 회장이 최우선
    if (positionA === '회장' && positionB !== '회장') return -1
    if (positionB === '회장' && positionA !== '회장') return 1
    
    // 부회장이 두 번째 우선
    if (positionA === '부회장' && positionB !== '부회장' && positionB !== '회장') return -1
    if (positionB === '부회장' && positionA !== '부회장' && positionA !== '회장') return 1
    
    // 나머지 운영진은 기수 먼저, 동기수 시 가나다 순
    const generationA = a.generation || 0
    const generationB = b.generation || 0
    
    if (generationA !== generationB) {
      return generationA - generationB // 낮은 기수부터
    }
    
    // 동기수인 경우 가나다 순
    const nameA = a.display_name.toLowerCase()
    const nameB = b.display_name.toLowerCase()
    return nameA.localeCompare(nameB, 'ko')
  })

  // 부원 정렬: 기수 먼저, 동기수 시 가나다 순
  const sortedRegularMembers = regularMembers.sort((a, b) => {
    const generationA = a.generation || 0
    const generationB = b.generation || 0
    
    if (generationA !== generationB) {
      return generationA - generationB // 낮은 기수부터
    }
    
    // 동기수인 경우 가나다 순
    const nameA = a.display_name.toLowerCase()
    const nameB = b.display_name.toLowerCase()
    return nameA.localeCompare(nameB, 'ko')
  })

  const MemberCard = ({ member }: { member: MemberProfile }) => (
    <div className="group glass p-6 rounded-xl hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] hover:border-violet-500/50">
      <div className="flex flex-col items-center text-center">
        {/* 프로필 이미지 */}
        <div className="w-24 h-24 bg-gradient-to-br from-violet-400 to-indigo-400 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-white text-3xl font-bold">
            {member.display_name.charAt(0)}
          </span>
        </div>

        {/* 기본 정보 */}
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
          {member.display_name}
        </h3>
        <p className="text-primary-400 font-semibold mb-3 bg-primary-500/10 px-3 py-1 rounded-full text-sm">
          {member.position || '부원'}
        </p>

        {/* 세부 정보 */}
        <div className="space-y-1 text-sm text-gray-400 mb-4">
          {member.generation && (
            <p className="font-semibold text-purple-400">{member.generation}기</p>
          )}
          {member.department && <p>{member.department}</p>}
          {member.year && <p>{member.year}</p>}
        </div>

        {/* 소개 */}
        {member.bio && (
          <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {member.bio}
          </p>
        )}
        
        {/* 연락처 */}
        <div className="flex space-x-3 mt-auto">
          {(member.links as any)?.github && (
            <a 
              href={`https://github.com/${(member.links as any).github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd"></path>
              </svg>
            </a>
          )}
          {(member.links as any)?.linkedin && (
            <a 
              href={`https://linkedin.com/in/${(member.links as any).linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary-400 transition-colors transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd"></path>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black overflow-hidden selection:bg-violet-500 selection:text-black">
      {/* 배경 효과 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[60px]" />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* 헤더 */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent animate-pulse-glow">
              AI Monsters
            </span>{' '}
            부원 소개
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            AIM 동아리의 멋진 부원들을 소개합니다.<br />
            각자의 전문성과 열정으로 함께 AI/ML 분야에서 성장하고 있습니다.
          </p>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400 animate-pulse">부원 정보를 불러오는 중...</p>
          </div>
        )}

        {/* 데이터가 없을 때 */}
        {!loading && members.length === 0 && (
          <div className="text-center py-20 glass rounded-2xl">
            <p className="text-gray-400 text-lg">등록된 부원이 없습니다.</p>
          </div>
        )}

        {/* 부원 목록 */}
        {!loading && members.length > 0 && (
          <>
            {/* 운영진 */}
            {sortedExecutives.length > 0 && (
              <section className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-3">운영진</h2>
                  <div className="w-24 h-1 bg-violet-500 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedExecutives.map(member => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </section>
            )}

            {/* 일반 부원 */}
            {sortedRegularMembers.length > 0 && (
              <section className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-bold text-white mb-3">부원</h2>
                  <div className="w-24 h-1 bg-purple-500 mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sortedRegularMembers.map(member => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </section>
            )}

            {/* 가입 안내 */}
            <section className="relative overflow-hidden rounded-2xl p-12 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-90" />
              <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-20" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">AI Monsters에 합류하세요!</h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  AI와 머신러닝에 관심이 있다면 언제든 환영합니다.<br />
                  함께 학습하고 성장할 수 있는 기회를 놓치지 마세요.
                </p>
                <Link 
                  href="/recruit" 
                  className="inline-block bg-white text-black font-bold py-4 px-10 rounded-xl text-lg hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transform hover:-translate-y-1 transition-all duration-300"
                >
                  모집 공고 보기
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 bg-black/80 backdrop-blur-xl border-t border-gray-800 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">&copy; 2024 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
