'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BookOpen, Code, Users, Trophy, Mail, Github, Instagram, MapPin, Check } from 'lucide-react'
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
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
    return <IconComponent className="w-7 h-7 text-violet-400" />
  }

  const isEmailContact = (label: string): boolean => {
    const lowerLabel = label.toLowerCase()
    return lowerLabel.includes('email') || lowerLabel.includes('이메일')
  }

  const isLinkContact = (label: string): boolean => {
    const linkLabels = ['github', 'GitHub', '깃허브', 'instagram', 'Instagram', '인스타그램']
    return linkLabels.includes(label)
  }

  const getContactHref = (label: string, value: string): string => {
    const lowerLabel = label.toLowerCase()
    if (lowerLabel.includes('github') || lowerLabel.includes('깃')) {
      return value.startsWith('http') ? value : `https://github.com/${value}`
    }
    if (lowerLabel.includes('instagram') || lowerLabel.includes('인스타')) {
      return value.startsWith('http') ? value : `https://instagram.com/${value}`
    }
    return ''
  }

  const handleCopyEmail = async (contactId: string, email: string) => {
    try {
      await navigator.clipboard.writeText(email)
      setCopiedId(contactId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  const handleContactClick = (contact: AboutContact) => {
    const isEmail = isEmailContact(contact.label)
    const isLink = isLinkContact(contact.label)

    if (isEmail) {
      handleCopyEmail(contact.id, contact.value)
    } else if (isLink) {
      const href = getContactHref(contact.label, contact.value)
      window.open(href, '_blank', 'noopener,noreferrer')
    }
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
                      <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">
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
                      <p className="text-gray-500 leading-relaxed whitespace-pre-line">
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
                {history.map((item) => (
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
                    <p className="text-gray-500 whitespace-pre-line">
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
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {contacts.map((contact) => {
                const isCopied = copiedId === contact.id
                const isEmail = isEmailContact(contact.label)

                return (
                  <div key={contact.id} className="relative group">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20">
                      <div className="bg-black/90 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl whitespace-nowrap">
                        <p className="text-white text-sm font-medium">{contact.value}</p>
                        {isEmail && !isCopied && (
                          <p className="text-gray-400 text-xs mt-1">클릭하여 복사</p>
                        )}
                        {isEmail && isCopied && (
                          <p className="text-green-400 text-xs mt-1 flex items-center gap-1 justify-center">
                            <Check className="w-3 h-3" />
                            복사됨!
                          </p>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                        <div className="w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45" />
                      </div>
                    </div>

                    {/* Icon Button */}
                    <button
                      onClick={() => handleContactClick(contact)}
                      className="relative w-16 h-16 rounded-full bg-white/[0.02] border border-white/10 hover:border-violet-500/50 hover:bg-white/[0.04] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] flex items-center justify-center cursor-pointer"
                    >
                      {getContactIcon(contact.label)}

                      {/* Glow ring on hover */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                    </button>

                    {/* Label below */}
                    <p className="text-center text-gray-500 text-sm mt-3 group-hover:text-violet-400 transition-colors">
                      {contact.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer spacer */}
      <div className="h-20" />
    </div>
  )
}
