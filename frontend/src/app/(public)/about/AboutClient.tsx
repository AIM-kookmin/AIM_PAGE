'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BookOpen, Code, Users, Trophy, Mail, Github, Instagram, MapPin } from 'lucide-react'
import type {
  AboutSection,
  AboutActivity,
  AboutHistory,
  AboutContact,
} from '@/types/supabase'

gsap.registerPlugin(ScrollTrigger)

interface AboutClientProps {
  sections: AboutSection[]
  activities: AboutActivity[]
  history: AboutHistory[]
  contacts: AboutContact[]
}

// 이모지를 Lucide 아이콘으로 매핑
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  '📚': BookOpen,
  '💻': Code,
  '🎤': Users,
  '🏆': Trophy,
  '📖': BookOpen,
  '🤖': Code,
  '👥': Users,
  '🏅': Trophy,
}

// Contact 라벨을 아이콘으로 매핑
const contactIconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Email': Mail,
  'email': Mail,
  '이메일': Mail,
  'GitHub': Github,
  'github': Github,
  '깃허브': Github,
  'Instagram': Instagram,
  'instagram': Instagram,
  '인스타그램': Instagram,
  '위치': MapPin,
  'Location': MapPin,
}

export default function AboutClient({
  sections,
  activities,
  history,
  contacts,
}: AboutClientProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null)
  const activitiesRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero 애니메이션
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )

      // Sections 애니메이션 - 부드러운 페이드 인
      gsap.fromTo(
        sectionsRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Activities 애니메이션 - 부드러운 페이드 인
      gsap.fromTo(
        activitiesRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: activitiesRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // History 애니메이션 - 부드러운 페이드 인
      gsap.fromTo(
        historyRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: historyRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      // Contact 애니메이션 - 부드러운 페이드 인
      gsap.fromTo(
        contactRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contactRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, mainRef)

    return () => ctx.revert()
  }, [])

  const getIcon = (emoji: string) => {
    const IconComponent = iconMap[emoji] || BookOpen
    return <IconComponent className="w-6 h-6 text-violet-400" />
  }

  const getContactIcon = (label: string) => {
    const IconComponent = contactIconMap[label] || Mail
    return <IconComponent className="w-5 h-5 text-violet-400" />
  }

  return (
    <div ref={mainRef} className="min-h-screen bg-black overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background effects - 부드러운 그라데이션 */}
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

      {/* Hero Section */}
      <section ref={heroRef} className="relative z-10 min-h-[60vh] flex items-center justify-center pt-20">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              AIM
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">AI Monsters</p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            국민대학교 AI 동아리
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-8 rounded-full" />
        </div>
      </section>

      {/* About Sections */}
      {sections.length > 0 && (
        <section ref={sectionsRef} className="relative z-10 py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-16">
              {sections.map((section) => (
                <div key={section.id} className="group">
                  <div className="flex items-start gap-6">
                    <div className="w-1 h-full bg-gradient-to-b from-violet-500 to-transparent rounded-full flex-shrink-0" />
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-violet-300 transition-colors">
                        {section.title}
                      </h2>
                      <p className="text-gray-400 text-lg leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Activities Section */}
      {activities.length > 0 && (
        <section ref={activitiesRef} className="relative z-10 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              주요 활동
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 group-hover:scale-110 transition-all duration-300">
                      {getIcon(activity.icon)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                        {activity.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* History Timeline */}
      {history.length > 0 && (
        <section ref={historyRef} className="relative z-10 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              연혁
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500 via-violet-500/50 to-transparent" />

              <div className="space-y-12">
                {history.map((item, index) => (
                  <div key={item.id} className="relative pl-20 group">
                    {/* Timeline dot */}
                    <div className="absolute left-6 top-1 w-5 h-5 rounded-full bg-black border-2 border-violet-500 group-hover:bg-violet-500 group-hover:scale-125 transition-all duration-300" />

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 mb-2">
                      <span className="text-violet-400 font-mono text-lg font-bold">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-gray-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {contacts.length > 0 && (
        <section ref={contactRef} className="relative z-10 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
              Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="group flex items-center gap-4 p-6 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
                    {getContactIcon(contact.label)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-500 text-sm mb-1">{contact.label}</p>
                    <p className="text-white font-medium truncate">{contact.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer spacer */}
      <div className="h-20" />
    </div>
  )
}
