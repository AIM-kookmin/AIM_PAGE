'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ScrollReveal from '@/shared/ui/ScrollReveal'

interface MemberPreview {
  id: string
  name: string
  role: string
  generation: number
  imageUrl?: string
}

const sampleMembers: MemberPreview[] = [
  { id: '1', name: '김민수', role: 'ML Engineer', generation: 10 },
  { id: '2', name: '이서연', role: 'Data Scientist', generation: 10 },
  { id: '3', name: '박지훈', role: 'Backend Dev', generation: 9 },
  { id: '4', name: '정유진', role: 'AI Researcher', generation: 9 },
  { id: '5', name: '최동현', role: 'Full Stack', generation: 10 },
  { id: '6', name: '강민지', role: 'CV Engineer', generation: 9 },
  { id: '7', name: '윤성호', role: 'NLP Specialist', generation: 10 },
  { id: '8', name: '한예림', role: 'MLOps', generation: 9 },
]

function MemberCard({ member }: { member: MemberPreview }) {
  return (
    <div className="flex-shrink-0 w-[280px] group">
      <div className="glass p-6 rounded-2xl hover:bg-white/[0.08] transition-all duration-300 hover:border-violet-500/30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/20">
            {member.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold truncate group-hover:text-violet-400 transition-colors">
              {member.name}
            </h4>
            <p className="text-white/50 text-sm truncate">{member.role}</p>
          </div>
          <span className="text-xs text-white/30 font-mono">{member.generation}기</span>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ members, direction = 'left', speed = 30 }: { 
  members: MemberPreview[]
  direction?: 'left' | 'right'
  speed?: number 
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      setContentWidth(containerRef.current.scrollWidth / 2)
    }
  }, [members])

  const duplicatedMembers = [...members, ...members]

  return (
    <div className="overflow-hidden py-2">
      <motion.div
        ref={containerRef}
        className="flex gap-4"
        animate={{
          x: direction === 'left' ? [0, -contentWidth] : [-contentWidth, 0],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {duplicatedMembers.map((member, index) => (
          <MemberCard key={`${member.id}-${index}`} member={member} />
        ))}
      </motion.div>
    </div>
  )
}

export default function MembersMarquee() {
  const firstRow = sampleMembers.slice(0, 4)
  const secondRow = sampleMembers.slice(4, 8)

  return (
    <section className="relative z-10 py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="text-violet-400 text-sm font-medium tracking-widest uppercase mb-4 block">
                Our Team
              </span>
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                Monsters
              </h2>
            </div>
            <Link 
              href="/members"
              className="text-white/60 hover:text-violet-400 transition-colors flex items-center gap-2 group"
            >
              <span>모든 부원 보기</span>
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
      </div>

      <div className="space-y-4">
        <MarqueeRow members={firstRow} direction="left" speed={25} />
        <MarqueeRow members={secondRow} direction="right" speed={30} />
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
    </section>
  )
}
