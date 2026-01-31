'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from '@/widgets/Hero'
import ActivitiesSection from '@/widgets/ActivitiesSection'
import AchievementsTimeline from '@/widgets/AchievementsTimeline'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const mainRef = useRef<HTMLDivElement>(null)
  const activitiesRef = useRef<HTMLDivElement>(null)
  const achievementsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        activitiesRef.current,
        { 
          x: '-100vw',
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: activitiesRef.current,
            start: 'top bottom',
            end: 'top 20%',
            scrub: 1,
          },
        }
      )

      gsap.fromTo(
        achievementsRef.current,
        { 
          x: '100vw',
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: achievementsRef.current,
            start: 'top bottom',
            end: 'top 20%',
            scrub: 1,
          },
        }
      )

      gsap.fromTo(
        ctaRef.current,
        { 
          scale: 0.5,
          opacity: 0,
          rotateX: 45,
        },
        {
          scale: 1,
          opacity: 1,
          rotateX: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top bottom',
            end: 'top 30%',
            scrub: 1,
          },
        }
      )
    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={mainRef} className="bg-black min-h-screen overflow-hidden selection:bg-violet-500 selection:text-white">
      <Hero />

      <div ref={activitiesRef} style={{ perspective: '1000px' }}>
        <ActivitiesSection />
      </div>

      <div ref={achievementsRef} style={{ perspective: '1000px' }}>
        <AchievementsTimeline />
      </div>

      <div ref={ctaRef} style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}>
        <section className="relative z-10 py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-indigo-900/20" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to be an{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                AI Monster
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              AI와 머신러닝의 괴물이 되어 여러분의 무한한 가능성을 발견하고
              <br />
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
      </div>

      <footer className="relative z-10 bg-black/80 backdrop-blur-xl border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500">&copy; 2025 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
