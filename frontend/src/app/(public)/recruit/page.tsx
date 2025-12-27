'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getActiveRecruitNotice,
  getAllRecruitNotices,
} from '@/shared/api/supabase'
import { APP_NAME } from '@/lib/config'
import type { RecruitNotice } from '@/types/supabase'

// UI Components
import { Button, Card, Badge, Text, Title, Subtitle, Loading, FAQ } from '@/shared/ui'

export default function RecruitPage() {
  const [recruitNotice, setRecruitNotice] = useState<RecruitNotice | null>(null)
  const [loading, setLoading] = useState(true)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [showPastRecruits, setShowPastRecruits] = useState(false)
  const [pastRecruits, setPastRecruits] = useState<RecruitNotice[]>([])
  const [loadingPast, setLoadingPast] = useState(false)

  // FAQ 데이터
  const faqData = [
    {
      question: "프로그래밍을 전혀 모르는데 지원할 수 있나요?",
      answer: "네! 열정과 의지만 있다면 충분합니다. 기초부터 차근차근 알려드리며, 멘토링 시스템을 통해 단계별로 학습할 수 있도록 도와드립니다."
    },
    {
      question: "다른 동아리와 중복 가입이 가능한가요?",
      answer: "가능하지만, AIM 활동에 적극적으로 참여할 수 있는지 고려해주세요. 정기 모임과 프로젝트 활동에 충분한 시간을 투자할 수 있어야 합니다."
    },
    {
      question: "학과 제한이 있나요?",
      answer: "없습니다! 모든 학과 학생을 환영합니다. 오히려 다양한 전공 배경의 학생들이 모여 더 창의적인 아이디어와 프로젝트가 나올 수 있습니다."
    },
    {
      question: "활동비가 있나요?",
      answer: "기본 활동비는 없으며, 필요시 동아리에서 지원합니다. 대회 참가비, 교육 자료비 등은 동아리 예산으로 지원됩니다."
    },
    {
      question: "면접은 어떤 식으로 진행되나요?",
      answer: "개별 면접으로 20분 내외 진행됩니다. 지원 동기, 관심 분야, 활동 계획 등에 대해 편안한 대화 형식으로 이루어집니다. 기술적 지식보다는 열정과 참여 의지를 중점적으로 봅니다."
    },
    {
      question: "모집 후 바로 프로젝트에 참여할 수 있나요?",
      answer: "신입 부원들을 위한 기초 교육 과정(약 1개월)을 거친 후 프로젝트에 참여하게 됩니다. 개인의 수준에 맞는 프로젝트를 배정하여 부담 없이 시작할 수 있습니다."
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  const fetchPastRecruits = async () => {
    setLoadingPast(true)
    try {
      const data = await getAllRecruitNotices()
      const now = new Date()
      const past = data.filter(notice => 
        !notice.is_open || new Date(notice.end_at) < now
      )
      setPastRecruits(past)
    } catch (error) {
      console.error('지난 모집 공고 조회 실패:', error)
    } finally {
      setLoadingPast(false)
    }
  }

  const handleShowPastRecruits = () => {
    if (!showPastRecruits && pastRecruits.length === 0) {
      fetchPastRecruits()
    }
    setShowPastRecruits(!showPastRecruits)
  }

  useEffect(() => {
    document.title = 'Recruit - AIM: AI Monsters'
    fetchActiveRecruitNotice()
  }, [])

  const fetchActiveRecruitNotice = async () => {
    try {
      const data = await getActiveRecruitNotice()
      setRecruitNotice(data)
    } catch (error) {
      console.error('모집 공고 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-violet-500/30 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[80px] mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/15 rounded-full blur-[80px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-violet-500/10 rounded-full blur-[80px] mix-blend-screen"></div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loading text="모집 공고를 불러오는 중..." size="lg" />
          </div>
        ) : recruitNotice ? (
          <div className="animate-fade-in-up">
            {/* 헤더 섹션 */}
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <Badge 
                  variant={recruitNotice.is_open && new Date(recruitNotice.end_at) > new Date() ? 'success' : 'warning'}
                  size="lg"
                  className="animate-pulse-glow"
                >
                  {recruitNotice.is_open && new Date(recruitNotice.end_at) > new Date() ? '🔥 모집중' : '📝 모집마감'}
                </Badge>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                  AIM
                </span>{' '}
                {recruitNotice.title}
              </h1>
              <Text variant="secondary" size="lg" className="mb-4 font-light">
                모집 기간: {new Date(recruitNotice.start_at).toLocaleDateString()} ~ {new Date(recruitNotice.end_at).toLocaleDateString()}
              </Text>
            </div>

            {/* 히어로 배너 섹션 */}
            <div className="relative mb-16 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass rounded-2xl overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5"></div>
                <div className="relative p-8 md:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* 왼쪽: 주요 정보 */}
                    <div>
                      <div className="flex items-center space-x-3 mb-6">
                        <span className="text-primary-400 font-medium tracking-wider text-sm uppercase">
                          Recruitment
                        </span>
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span className="text-gray-400 text-sm">
                          D-{Math.ceil((new Date(recruitNotice.end_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                        {recruitNotice.title}
                      </h2>
                      
                      <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        {recruitNotice.short_description || (
                          <>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-500 font-semibold">AI Monsters</span>와 함께 인공지능의 세계로 빠져보세요! 
                            경험과 전공에 상관없이 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500 font-semibold">열정</span>만 있다면 누구나 환영합니다.
                          </>
                        )}
                      </p>
                      
                      {recruitNotice.external_form_url && (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <a
                            href={recruitNotice.external_form_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl hover:from-violet-400 hover:to-indigo-500 focus:outline-none ring-offset-2 focus:ring-2 ring-primary-400"
                          >
                            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                            <span className="relative flex items-center gap-2">
                              🚀 지금 지원하기
                            </span>
                          </a>
                          <Link
                            href="/about"
                            className="px-8 py-4 rounded-xl font-bold text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white transition-all duration-300 text-center backdrop-blur-sm"
                          >
                            동아리 더 알아보기
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {/* 오른쪽: 핵심 정보 카드 */}
                    <div className="space-y-4">
                      <div className="glass-hover p-6 rounded-xl border border-white/5 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-violet-500/30">
                            <span className="text-2xl">📅</span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold mb-1">모집 기간</h3>
                            <p className="text-gray-400 text-sm">
                              {new Date(recruitNotice.start_at).toLocaleDateString()} ~ {new Date(recruitNotice.end_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="glass-hover p-6 rounded-xl border border-white/5 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                            <span className="text-2xl">🎯</span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold mb-1">모집 대상</h3>
                            <p className="text-gray-400 text-sm">
                              {recruitNotice.target_audience || "국민대학교 재학생 (전 학과/학년)"}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="glass-hover p-6 rounded-xl border border-white/5 transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                            <span className="text-2xl">👥</span>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold mb-1">모집 인원</h3>
                            <p className="text-gray-400 text-sm">
                              {recruitNotice.recruit_count ? 
                                `${recruitNotice.recruit_count}${recruitNotice.recruit_method ? ` (${recruitNotice.recruit_method})` : ''}` :
                                "15명 내외 (서류 + 면접)"
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 상세 내용 */}
            <div className="mb-16">
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="flex items-center space-x-4 mb-10 pb-6 border-b border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                      <span className="text-white font-bold text-xl">📝</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">모집 공고 상세</h2>
                  </div>
                  
                  <div className="prose prose-invert max-w-none prose-lg">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => (
                          <h1 className="text-3xl font-bold text-white mb-8 pb-4 border-b border-white/10 inline-block bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                            {children}
                          </h1>
                        ),
                        h2: ({children}) => (
                          <h2 className="text-2xl font-bold text-white mb-6 mt-12 flex items-center">
                            <span className="w-1.5 h-8 bg-gradient-to-b from-violet-400 to-indigo-600 rounded-full mr-4"></span>
                            {children}
                          </h2>
                        ),
                        h3: ({children}) => (
                          <h3 className="text-xl font-semibold text-white/90 mb-4 mt-8 flex items-center">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full mr-3"></span>
                            {children}
                          </h3>
                        ),
                        p: ({children}) => <p className="text-gray-300 mb-6 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="text-gray-300 mb-8 space-y-3">{children}</ul>,
                        ol: ({children}) => <ol className="text-gray-300 mb-8 space-y-3 list-decimal list-inside">{children}</ol>,
                        li: ({children}) => (
                          <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
                            <span className="leading-relaxed">{children}</span>
                          </li>
                        ),
                        strong: ({children}) => <strong className="text-white font-bold bg-gradient-to-r from-violet-200 to-indigo-200 bg-clip-text text-transparent">{children}</strong>,
                        em: ({children}) => <em className="text-primary-300 not-italic">{children}</em>,
                        code: ({children}) => <code className="bg-white/10 text-primary-300 px-2 py-0.5 rounded text-sm font-mono border border-white/10">{children}</code>,
                        pre: ({children}) => <pre className="bg-black/50 text-gray-300 p-6 rounded-xl overflow-x-auto text-sm mb-8 border border-white/10 shadow-inner">{children}</pre>,
                        a: ({href, children}) => (
                          <a 
                            href={href} 
                            className="text-primary-400 hover:text-primary-300 underline decoration-1 underline-offset-4 transition-colors" 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-violet-500/50 bg-white/5 pl-6 py-4 italic text-gray-300 mb-8 rounded-r-xl">
                            {children}
                          </blockquote>
                        ),
                        hr: () => <hr className="border-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-12" />,
                        table: ({children}) => (
                          <div className="overflow-x-auto mb-8 rounded-xl border border-white/10">
                            <table className="min-w-full bg-white/5">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({children}) => <th className="px-6 py-4 bg-white/10 text-white font-bold text-left border-b border-white/10">{children}</th>,
                        td: ({children}) => <td className="px-6 py-4 text-gray-300 border-b border-white/5">{children}</td>
                      }}
                    >
                      {recruitNotice.body_md}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
              
            {/* 지원하기 섹션 */}
            {recruitNotice.external_form_url && (
              <div className="relative mb-16 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative glass rounded-2xl overflow-hidden border border-white/10 p-12 text-center">
                  <div className="mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/20 animate-float">
                      <span className="text-white text-5xl">🚀</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                      <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                        AI Monster
                      </span>{' '}
                      되어보세요!
                    </h3>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                      인공지능의 세계로 첫 발을 내딛을 준비가 되셨나요?<br />
                      함께 성장하고, 배우고, 꿈을 이룰 동료들이 기다리고 있어요.
                    </p>
                  </div>
                  
                  <div className="space-y-8">
                    <a
                      href={recruitNotice.external_form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-2xl hover:from-violet-400 hover:to-indigo-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25"
                    >
                      <span className="flex items-center space-x-3">
                        <span>📝</span>
                        <span>지원서 작성하기</span>
                        <span className="text-2xl">→</span>
                      </span>
                    </a>
                    
                    <div className="flex flex-col md:flex-row justify-center gap-6 text-gray-400 text-sm">
                      <a href="mailto:aim@kookmin.ac.kr" className="flex items-center justify-center gap-2 hover:text-primary-400 transition-colors">
                        <span>💬</span> 지원 관련 문의: aim@kookmin.ac.kr
                      </a>
                      <a href="https://instagram.com/aim_monsters" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 hover:text-purple-400 transition-colors">
                        <span>📱</span> 더 많은 정보: @aim_monsters
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="glass-hover p-6 rounded-xl border border-white/5">
                      <div className="text-4xl mb-4">⚡</div>
                      <h4 className="text-white font-bold mb-2 text-lg">빠른 합격 통보</h4>
                      <p className="text-gray-400 text-sm">면접 후 3일 이내 결과 통보</p>
                    </div>
                    <div className="glass-hover p-6 rounded-xl border border-white/5">
                      <div className="text-4xl mb-4">💪</div>
                      <h4 className="text-white font-bold mb-2 text-lg">경험 무관</h4>
                      <p className="text-gray-400 text-sm">열정만 있다면 누구나 환영</p>
                    </div>
                    <div className="glass-hover p-6 rounded-xl border border-white/5">
                      <div className="text-4xl mb-4">🎯</div>
                      <h4 className="text-white font-bold mb-2 text-lg">체계적 교육</h4>
                      <p className="text-gray-400 text-sm">기초부터 실무까지 단계별 학습</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ 섹션 */}
            <div className="relative mb-16">
              <div className="glass rounded-2xl border border-white/10 overflow-hidden p-1">
                <FAQ 
                  items={faqData}
                  title="자주 묻는 질문"
                  icon="💡"
                />
                <div className="mt-8 text-center px-8 pb-8">
                  <Text variant="secondary">
                    더 궁금한 점이 있으시면{' '}
                    <a href="mailto:aim@kookmin.ac.kr" className="text-primary-400 hover:text-primary-300 font-medium underline decoration-1 underline-offset-4">
                      aim@kookmin.ac.kr
                    </a>
                    {' '}로 문의해주세요!
                  </Text>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {/* 기본 헤더 섹션 (모집 공고가 없을 때) */}
            <div className="text-center mb-24 pt-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                <span className="text-4xl">📢</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                  AIM
                </span>{' '}
                모집 안내
              </h1>
              <Subtitle className="mb-12 text-gray-400 max-w-xl mx-auto">
                현재 진행중인 모집이 없습니다.<br />
                다음 모집 기간을 기다려주세요.
              </Subtitle>
              
              {/* 지난 모집 보기 버튼 */}
              <div className="flex justify-center">
                <Button
                  onClick={handleShowPastRecruits}
                  variant="ghost"
                  className="px-8 py-4 rounded-xl font-medium flex items-center gap-3 text-lg hover:bg-white/5 transition-all"
                >
                  {showPastRecruits ? '지난 모집 숨기기' : '지난 모집 공고 확인하기'}
                  <span className={`text-xl transition-transform duration-300 ${showPastRecruits ? 'rotate-180' : ''}`}>
                    ↓
                  </span>
                </Button>
              </div>
            </div>
            
            {/* 지난 모집 공고 목록 */}
            {showPastRecruits && (
              <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up">
                <div className="flex items-center space-x-4 mb-8 px-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <span className="text-gray-400 font-medium">Archive</span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>
                
                {loadingPast ? (
                  <div className="py-12 flex justify-center">
                    <Loading text="지난 모집 공고를 불러오는 중..." />
                  </div>
                ) : pastRecruits.length === 0 ? (
                  <div className="text-center py-12 glass rounded-xl border border-white/5">
                    <Text variant="secondary">지난 모집 공고가 없습니다.</Text>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pastRecruits.map((notice) => (
                      <div key={notice.id} className="glass-hover rounded-xl border border-white/5 p-6 transition-all duration-300 hover:border-white/20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                          <h3 className="text-xl font-bold text-white">{notice.title}</h3>
                          <Badge variant="muted" className="bg-white/5 text-gray-400 border-white/10">
                            마감됨
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white/5 rounded-lg p-4">
                          {notice.target_audience && (
                            <div className="text-center border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 md:pr-2">
                              <Text variant="secondary" size="sm" className="mb-1">모집 대상</Text>
                              <Text variant="primary" weight="medium" className="text-sm">{notice.target_audience}</Text>
                            </div>
                          )}
                          {notice.recruit_count && (
                            <div className="text-center border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0 md:pr-2">
                              <Text variant="secondary" size="sm" className="mb-1">모집 인원</Text>
                              <Text variant="primary" weight="medium" className="text-sm">{notice.recruit_count}</Text>
                            </div>
                          )}
                          {notice.recruit_method && (
                            <div className="text-center">
                              <Text variant="secondary" size="sm" className="mb-1">모집 방법</Text>
                              <Text variant="primary" weight="medium" className="text-sm">{notice.recruit_method}</Text>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-white/5">
                          <Text variant="secondary" size="sm" className="flex items-center gap-2">
                            <span>📅</span> {new Date(notice.start_at).toLocaleDateString()} ~ {new Date(notice.end_at).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 모집 공고가 없을 때는 FAQ만 표시 */}
        {!loading && !recruitNotice && (
          <div className="max-w-3xl mx-auto mt-24">
            <div className="glass rounded-2xl border border-white/10 overflow-hidden p-1">
              <FAQ 
                items={faqData}
                title="자주 묻는 질문"
                icon="💡"
              />
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="relative z-10 bg-black/80 backdrop-blur-xl border-t border-white/10 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* 문의하기 섹션 */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-center md:justify-start gap-2">
                <span>💬</span> 문의하기
              </h3>
              <p className="text-gray-400 mb-6 font-light">
                모집 관련 문의사항이 있으시면<br/>운영진에게 문의 바랍니다.
              </p>
              <a 
                href="mailto:aim@kookmin.ac.kr"
                className="inline-flex items-center bg-white/5 hover:bg-white/10 text-primary-400 px-6 py-3 rounded-xl font-medium transition-colors border border-white/10"
              >
                📧 aim@kookmin.ac.kr
              </a>
            </div>
            
            {/* 빠른 링크 */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-center md:justify-start gap-2">
                <span>🔗</span> 빠른 링크
              </h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-400 hover:text-primary-400 transition-colors">
                  AIM 소개
                </Link>
                <Link href="/members" className="block text-gray-400 hover:text-primary-400 transition-colors">
                  멤버 소개
                </Link>
                <Link href="/login" className="block text-gray-400 hover:text-primary-400 transition-colors">
                  운영진 로그인
                </Link>
              </div>
            </div>
            
            {/* 동아리 정보 */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-center md:justify-start gap-2">
                <span>👾</span> AIM
              </h3>
              <p className="text-gray-300 mb-2 font-medium">
                AI Monsters
              </p>
              <p className="text-gray-500 text-sm font-light">
                국민대학교 AI와 머신러닝 동아리<br/>
                Kookmin University AI & ML Club
              </p>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-600 text-sm">&copy; 2024 AIM (AI Monsters). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
