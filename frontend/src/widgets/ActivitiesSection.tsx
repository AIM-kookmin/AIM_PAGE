'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ScrollReveal from '@/shared/ui/ScrollReveal'

interface Activity {
  id: string
  number: string
  title: string
  description: string
  icon: React.ReactNode
}

const activities: Activity[] = [
  {
    id: 'study',
    number: '01',
    title: '스터디 그룹',
    description: 'ML/DL 논문 리딩, 알고리즘 스터디, 최신 AI 기술 트렌드를 함께 학습합니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'project',
    number: '02',
    title: '프로젝트 팀',
    description: '실제 문제를 해결하는 AI 프로젝트를 기획하고 개발합니다. 포트폴리오 구축의 기회.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: 'competition',
    number: '03',
    title: '대회 참가',
    description: 'Kaggle, DACON 등 국내외 AI 대회에 팀으로 참가하여 실력을 겨룹니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    id: 'seminar',
    number: '04',
    title: '세미나 & 워크샵',
    description: '현업 전문가 초청 세미나, 실습 워크샵을 통해 실무 경험을 쌓습니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'networking',
    number: '05',
    title: '네트워킹',
    description: '졸업생 멘토링, 기업 연계, 타 대학 동아리와의 교류를 통해 인맥을 넓힙니다.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const direction = index % 2 === 0 ? 'left' : 'right'

  return (
    <ScrollReveal delay={index * 0.1} direction={direction}>
      <motion.div
        className="group relative border-b border-white/10 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="py-8 md:py-12 px-4 md:px-8 flex items-center justify-between gap-8">
          <div className="flex items-center gap-6 md:gap-12 flex-1">
            <span className="text-white/30 text-sm font-mono w-8">{activity.number}</span>
            
            <div className="flex-1">
              <h3 className="text-2xl md:text-4xl font-bold text-white group-hover:text-violet-400 transition-colors duration-300">
                {activity.title}
              </h3>
              
              <AnimatePresence>
                {isHovered && (
                  <motion.p
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-white/60 text-base md:text-lg max-w-2xl overflow-hidden"
                  >
                    {activity.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            className="text-white/40 group-hover:text-violet-400 transition-colors duration-300"
            animate={{ x: isHovered ? 10 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {activity.icon}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-violet-500 to-indigo-500"
          initial={{ width: '0%' }}
          animate={{ width: isHovered ? '100%' : '0%' }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </ScrollReveal>
  )
}

export default function ActivitiesSection() {
  return (
    <section className="relative z-10 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="right">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
            <div>
              <span className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4 block">
                What We Do
              </span>
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                Activities
              </h2>
            </div>
            <Link 
              href="/activities"
              className="text-white/60 hover:text-violet-400 transition-colors flex items-center gap-2 group"
            >
              <span>모든 활동 보기</span>
              <svg 
                className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        <div className="border-t border-white/10">
          {activities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
