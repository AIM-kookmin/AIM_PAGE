'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    document.title = 'AIM: AI Monsters - 국민대학교 AI 동아리'
  }, [])

  return (
    <div className="bg-black min-h-screen overflow-hidden selection:bg-violet-500 selection:text-white">
        {/* 배경 효과 */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[80px]" />
          <div className="absolute top-[30%] right-[-15%] w-[40%] h-[40%] bg-indigo-600/15 rounded-full blur-[60px]" />
          <div className="absolute bottom-[-10%] left-[30%] w-[45%] h-[45%] bg-violet-500/10 rounded-full blur-[70px]" />
        </div>

        {/* 히어로 섹션 */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* 히어로 로고 */}
            <div className="mb-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 blur-2xl opacity-15 rounded-full" />
                <img 
                  src="/images/logo_hero.png" 
                  alt="AIM 동아리 로고" 
                  className="relative mx-auto h-40 md:h-64 lg:h-80 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            
            {/* 메인 타이틀 */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight animate-fade-in-up">
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse-glow">
                AIM
              </span>
            </h1>
            
            {/* 서브 타이틀 */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-300 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              AI Monsters
            </h2>
            
            {/* 설명 */}
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              국민대학교 AI와 머신러닝의 괴물들이 모인 곳.<br />
              함께 코딩하고, 학습하며, 세상을 바꿀 AI 프로젝트를 만들어갑니다.
            </p>
            
            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Link 
                href="/about" 
                className="group relative px-8 py-4 bg-primary-500 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-primary"
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 origin-left" />
                <span className="relative text-black text-lg font-bold">동아리 알아보기</span>
              </Link>
              <Link 
                href="/members" 
                className="group px-8 py-4 rounded-xl border border-white/20 text-white/80 text-lg font-bold hover:bg-white/5 hover:border-white/30 transition-all duration-300"
              >
                부원 소개
              </Link>
            </div>
          </div>
          
          {/* 스크롤 유도 아이콘 */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-gray-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* 소개 섹션 */}
        <section className="relative z-10 py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 섹션 타이틀 */}
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Become an <span className="text-violet-400">AI Monster</span>?
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                AI 괴물이 되어 함께 성장하고 배울 수 있는 최고의 환경을 제공합니다
              </p>
            </div>

            {/* 특징 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Study Card */}
              <div className="group glass p-8 rounded-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] hover:border-violet-500/50">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-violet-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-violet-400 transition-colors">Study</h3>
                <p className="text-gray-400 leading-relaxed">정기적인 스터디 모임을 통해 AI/ML 관련 최신 기술을 함께 학습하고 지식을 공유합니다.</p>
              </div>
              
              {/* Project Card */}
              <div className="group glass p-8 rounded-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)] hover:border-purple-500/50">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-purple-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">Project</h3>
                <p className="text-gray-400 leading-relaxed">실무 중심의 프로젝트를 통해 이론을 실전에 적용하고 포트폴리오를 구축합니다.</p>
              </div>
              
              {/* Networking Card */}
              <div className="group glass p-8 rounded-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(129,140,248,0.3)] hover:border-indigo-400/50">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-indigo-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors">Networking</h3>
                <p className="text-gray-400 leading-relaxed">동일한 관심사를 가진 사람들과 네트워크를 형성하고 함께 성장할 수 있는 환경을 제공합니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="relative z-10 py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-indigo-900/20" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to be an <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">AI Monster</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              AI와 머신러닝의 괴물이 되어 여러분의 무한한 가능성을 발견하고<br />
              함께하는 Monster들과 세상을 바꿔보세요
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/recruit"
                className="group relative px-8 py-4 bg-white text-black rounded-xl text-lg font-bold hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="relative z-10">모집 공고 보기</span>
                <div className="absolute inset-0 bg-violet-100 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 border border-white/30 text-white rounded-xl text-lg font-bold hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                동아리 알아보기
              </Link>
            </div>
          </div>
        </section>

      {/* 푸터 */}
      <footer className="relative z-10 bg-black/80 backdrop-blur-xl border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">&copy; 2025 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
