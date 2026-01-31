'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/shared/ui/ScrollReveal'

interface Achievement {
  id: string
  year: number
  title: string
  description: string
  category: 'award' | 'event' | 'milestone'
}

const categoryColors = {
  award: 'from-amber-500 to-orange-500',
  event: 'from-violet-500 to-indigo-500',
  milestone: 'from-emerald-500 to-teal-500',
}

const categoryLabels = {
  award: '수상',
  event: '행사',
  milestone: '마일스톤',
}

function TimelineItem({ achievement, index }: { achievement: Achievement; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <ScrollReveal delay={index * 0.1}>
      <motion.div 
        className="relative pl-8 md:pl-12 pb-12 last:pb-0"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-white/10 to-transparent" />
        
        <motion.div 
          className={`absolute left-0 top-1 w-2 h-2 rounded-full bg-gradient-to-r ${categoryColors[achievement.category]} -translate-x-[3px]`}
          whileHover={{ scale: 1.5 }}
        />

        <div 
          className="glass p-6 rounded-xl cursor-pointer hover:bg-white/[0.08] transition-all duration-300 group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${categoryColors[achievement.category]} text-white`}>
                {categoryLabels[achievement.category]}
              </span>
              <span className="text-white/40 text-sm font-mono">{achievement.year}</span>
            </div>
            <motion.svg 
              className="w-5 h-5 text-white/40 group-hover:text-violet-400 transition-colors"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors">
            {achievement.title}
          </h3>

          <AnimatePresence>
            {isExpanded && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2 }}
                className="text-white/60 overflow-hidden"
              >
                {achievement.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </ScrollReveal>
  )
}

interface AchievementsTimelineProps {
  achievements?: Achievement[]
}

export default function AchievementsTimeline({ achievements = [] }: AchievementsTimelineProps) {
  return (
    <section className="relative z-10 py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="left">
          <div className="text-center mb-16">
            <span className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4 block">
              Track Record
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Achievements
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              AI Monster들이 함께 만들어온 성과와 여정
            </p>
          </div>
        </ScrollReveal>

        <div className="flex gap-4 justify-center mb-12 flex-wrap">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoryColors[key as keyof typeof categoryColors]}`} />
              <span className="text-white/60 text-sm">{label}</span>
            </div>
          ))}
        </div>

        <div className="relative">
          {achievements.length > 0 ? (
            achievements.map((achievement, index) => (
              <TimelineItem key={achievement.id} achievement={achievement} index={index} />
            ))
          ) : (
            <p className="text-white/40 text-center py-12">성과 정보가 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  )
}
