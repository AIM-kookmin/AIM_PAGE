'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Calendar,
  Target,
  Users,
  Rocket,
  FileText,
  Mail,
  Instagram,
  Zap,
  Heart,
  GraduationCap,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  Clock,
  CheckCircle,
} from 'lucide-react'
import {
  getActiveRecruitNotice,
  getAllRecruitNotices,
} from '@/shared/api/supabase'
import type { RecruitNotice } from '@/types/supabase'

gsap.registerPlugin(ScrollTrigger)

export default function RecruitPage() {
  const [recruitNotice, setRecruitNotice] = useState<RecruitNotice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPastRecruits, setShowPastRecruits] = useState(false)
  const [pastRecruits, setPastRecruits] = useState<RecruitNotice[]>([])
  const [loadingPast, setLoadingPast] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const infoRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

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
      answer: "개별 면접으로 20분 내외 진행됩니다. 지원 동기, 관심 분야, 활동 계획 등에 대해 편안한 대화 형식으로 이루어집니다."
    },
  ]

  useEffect(() => {
    document.title = 'Recruit - AIM: AI Monsters'
    fetchActiveRecruitNotice()
  }, [])

  useEffect(() => {
    if (loading) return

    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      )

      if (infoRef.current) {
        gsap.fromTo(infoRef.current,
          { x: '-100vw', opacity: 0 },
          {
            x: 0, opacity: 1, ease: 'power2.out',
            scrollTrigger: { trigger: infoRef.current, start: 'top bottom', end: 'top 30%', scrub: true }
          }
        )
      }

      if (detailRef.current) {
        gsap.fromTo(detailRef.current,
          { x: '100vw', opacity: 0 },
          {
            x: 0, opacity: 1, ease: 'power2.out',
            scrollTrigger: { trigger: detailRef.current, start: 'top bottom', end: 'top 30%', scrub: true }
          }
        )
      }

      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { scale: 0.8, opacity: 0 },
          {
            scale: 1, opacity: 1, ease: 'power2.out',
            scrollTrigger: { trigger: ctaRef.current, start: 'top bottom', end: 'top 40%', scrub: true }
          }
        )
      }

      if (faqRef.current) {
        gsap.fromTo(faqRef.current,
          { y: 100, opacity: 0 },
          {
            y: 0, opacity: 1, ease: 'power2.out',
            scrollTrigger: { trigger: faqRef.current, start: 'top bottom', end: 'top 50%', scrub: true }
          }
        )
      }
    }, mainRef)

    return () => ctx.revert()
  }, [loading])

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

  const fetchPastRecruits = async () => {
    setLoadingPast(true)
    try {
      const data = await getAllRecruitNotices()
      const now = new Date()
      const past = data.filter(notice => !notice.is_open || new Date(notice.end_at) < now)
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

  const getDaysLeft = () => {
    if (!recruitNotice) return 0
    return Math.ceil((new Date(recruitNotice.end_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  const isOpen = recruitNotice?.is_open && new Date(recruitNotice.end_at) > new Date()

  return (
    <div ref={mainRef} className="min-h-screen bg-black overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />
      </div>

      <main className="relative z-10">
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">모집 공고를 불러오는 중...</p>
            </div>
          </div>
        ) : recruitNotice ? (
          <>
            {/* Hero Section */}
            <section ref={heroRef} className="min-h-[70vh] flex items-center justify-center pt-20 px-4">
              <div className="text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
                  {isOpen ? (
                    <>
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-400 text-sm font-medium">모집중</span>
                      <span className="text-gray-500 text-sm">D-{getDaysLeft()}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-500 rounded-full" />
                      <span className="text-gray-400 text-sm font-medium">모집마감</span>
                    </>
                  )}
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    AIM
                  </span>
                  <br />
                  <span className="text-3xl md:text-4xl text-gray-300 font-normal">
                    {recruitNotice.title}
                  </span>
                </h1>

                <p className="text-lg text-gray-500 mb-8">
                  {new Date(recruitNotice.start_at).toLocaleDateString()} ~ {new Date(recruitNotice.end_at).toLocaleDateString()}
                </p>

                {recruitNotice.external_form_url && isOpen && (
                  <a
                    href={recruitNotice.external_form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-violet-500 hover:bg-violet-400 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
                  >
                    <Rocket className="w-5 h-5" />
                    지금 지원하기
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-12 rounded-full" />
              </div>
            </section>

            {/* Info Cards */}
            <section ref={infoRef} className="py-24 px-4">
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-colors">
                      <Calendar className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">모집 기간</h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(recruitNotice.start_at).toLocaleDateString()} ~ {new Date(recruitNotice.end_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-colors">
                      <Target className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">모집 대상</h3>
                    <p className="text-gray-500 text-sm">
                      {recruitNotice.target_audience || "국민대학교 재학생 (전 학과/학년)"}
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-500/20 transition-colors">
                      <Users className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-white font-bold mb-2">모집 인원</h3>
                    <p className="text-gray-500 text-sm">
                      {recruitNotice.recruit_count || "15명 내외"}
                      {recruitNotice.recruit_method && ` (${recruitNotice.recruit_method})`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Detail Section */}
            <section ref={detailRef} className="py-24 px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-violet-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">모집 공고 상세</h2>
                </div>

                <div className="p-8 md:p-12 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({children}) => <h1 className="text-2xl font-bold text-white mb-6 mt-8">{children}</h1>,
                        h2: ({children}) => (
                          <h2 className="text-xl font-bold text-white mb-4 mt-10 flex items-center gap-3">
                            <span className="w-1 h-6 bg-violet-500 rounded-full" />
                            {children}
                          </h2>
                        ),
                        h3: ({children}) => <h3 className="text-lg font-semibold text-white/90 mb-3 mt-6">{children}</h3>,
                        p: ({children}) => <p className="text-gray-400 mb-4 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="text-gray-400 mb-6 space-y-2">{children}</ul>,
                        li: ({children}) => (
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({children}) => <strong className="text-white font-semibold">{children}</strong>,
                        a: ({href, children}) => (
                          <a href={href} className="text-violet-400 hover:text-violet-300 underline underline-offset-4" target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="border-l-2 border-violet-500/50 pl-6 py-2 text-gray-400 italic my-6">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {recruitNotice.body_md}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            {recruitNotice.external_form_url && isOpen && (
              <section ref={ctaRef} className="py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-8">
                    <Rocket className="w-10 h-10 text-violet-400" />
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                      AI Monster
                    </span>
                    가 되어보세요
                  </h2>

                  <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    인공지능의 세계로 첫 발을 내딛을 준비가 되셨나요?
                  </p>

                  <a
                    href={recruitNotice.external_form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-12 py-5 bg-violet-500 hover:bg-violet-400 text-white text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 mb-12"
                  >
                    <FileText className="w-6 h-6" />
                    지원서 작성하기
                    <ChevronRight className="w-5 h-5" />
                  </a>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                      <Zap className="w-8 h-8 text-violet-400 mx-auto mb-4" />
                      <h3 className="text-white font-bold mb-2">빠른 합격 통보</h3>
                      <p className="text-gray-500 text-sm">면접 후 3일 이내</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                      <Heart className="w-8 h-8 text-violet-400 mx-auto mb-4" />
                      <h3 className="text-white font-bold mb-2">경험 무관</h3>
                      <p className="text-gray-500 text-sm">열정만 있다면 OK</p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                      <GraduationCap className="w-8 h-8 text-violet-400 mx-auto mb-4" />
                      <h3 className="text-white font-bold mb-2">체계적 교육</h3>
                      <p className="text-gray-500 text-sm">기초부터 실무까지</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ Section */}
            <section ref={faqRef} className="py-24 px-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-12 justify-center">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-violet-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">자주 묻는 질문</h2>
                </div>

                <div className="space-y-4">
                  {faqData.map((faq, index) => (
                    <div
                      key={index}
                      className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <span className="text-white font-medium pr-4">{faq.question}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === index && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-center text-gray-500 mt-8">
                  더 궁금한 점이 있으시면{' '}
                  <a href="mailto:aim.club@kookmin.ac.kr" className="text-violet-400 hover:text-violet-300">
                    aim.club@kookmin.ac.kr
                  </a>
                  로 문의해주세요
                </p>
              </div>
            </section>
          </>
        ) : (
          /* No Active Recruit */
          <section ref={heroRef} className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-8">
                <Clock className="w-12 h-12 text-gray-600" />
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  AIM
                </span>{' '}
                모집 안내
              </h1>

              <p className="text-xl text-gray-500 mb-12">
                현재 진행중인 모집이 없습니다.<br />
                다음 모집 기간을 기다려주세요.
              </p>

              <button
                onClick={handleShowPastRecruits}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:border-violet-500/30 transition-all duration-300"
              >
                지난 모집 공고 확인하기
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showPastRecruits ? 'rotate-180' : ''}`} />
              </button>

              {showPastRecruits && (
                <div className="mt-12">
                  {loadingPast ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : pastRecruits.length === 0 ? (
                    <p className="text-gray-500">지난 모집 공고가 없습니다.</p>
                  ) : (
                    <div className="space-y-4 text-left">
                      {pastRecruits.map((notice) => (
                        <div key={notice.id} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                          <h3 className="text-white font-bold mb-2">{notice.title}</h3>
                          <p className="text-gray-500 text-sm">
                            {new Date(notice.start_at).toLocaleDateString()} ~ {new Date(notice.end_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-16">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
                >
                  동아리 더 알아보기
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 mt-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">&copy; 2025 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
