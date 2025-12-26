'use client'

import { useEffect, useState } from 'react'
import { Card, Text, Title, Subtitle, Loading } from '@/shared/ui'
import { APP_NAME } from '@/lib/config'
import {
  getAboutSections,
  getAboutActivities,
  getAboutHistory,
  getAboutContacts,
} from '@/shared/api/supabase'
import type {
  AboutSection,
  AboutActivity,
  AboutHistory,
  AboutContact,
} from '@/types/supabase'

export default function AboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([])
  const [activities, setActivities] = useState<AboutActivity[]>([])
  const [history, setHistory] = useState<AboutHistory[]>([])
  const [contacts, setContacts] = useState<AboutContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = `About - ${APP_NAME}`
    fetchAboutData()
  }, [])

  const fetchAboutData = async () => {
    try {
      const [sectionsData, activitiesData, historyData, contactsData] = await Promise.all([
        getAboutSections(),
        getAboutActivities(),
        getAboutHistory(),
        getAboutContacts()
      ])

      setSections(sectionsData)
      setActivities(activitiesData)
      setHistory(historyData)
      setContacts(contactsData)
    } catch (error) {
      console.error('소개 데이터 로드 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { border: string; text: string; bg: string } } = {
      'cyan': { border: 'hover:border-cyan-500', text: 'text-cyan-400', bg: 'from-cyan-500 to-blue-600' },
      'pink': { border: 'hover:border-pink-500', text: 'text-pink-400', bg: 'from-pink-500 to-purple-600' },
      'yellow': { border: 'hover:border-yellow-500', text: 'text-yellow-400', bg: 'from-yellow-500 to-orange-600' },
      'purple': { border: 'hover:border-purple-500', text: 'text-purple-400', bg: 'from-purple-500 to-indigo-600' },
      'green': { border: 'hover:border-green-500', text: 'text-green-400', bg: 'from-green-500 to-emerald-600' },
      'blue': { border: 'hover:border-blue-500', text: 'text-blue-400', bg: 'from-blue-500 to-cyan-600' },
      'red': { border: 'hover:border-red-500', text: 'text-red-400', bg: 'from-red-500 to-rose-600' },
      'orange': { border: 'hover:border-orange-500', text: 'text-orange-400', bg: 'from-orange-500 to-red-600' }
    }
    
    return colorMap[color] || colorMap['cyan']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex justify-center items-center h-screen">
          <Loading text="소개 내용을 불러오는 중..." size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* 배경 효과 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass p-8 md:p-12 rounded-2xl animate-fade-in-up">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent animate-pulse-glow">
                AIM (AI Monsters)
              </span>{' '}
              동아리 소개
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-pink-500 mx-auto rounded-full" />
          </div>
          
          {sections.map((section, index) => (
            <section key={section.id} className="mb-12 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="w-2 h-8 bg-cyan-500 rounded-full mr-3" />
                {section.title}
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg pl-5 border-l border-gray-700">
                {section.content}
              </p>
            </section>
          ))}

          {activities.length > 0 && (
            <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-8 bg-pink-500 rounded-full mr-3" />
                주요 활동
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((activity) => {
                  const colorClasses = getColorClasses(activity.color)
                  return (
                    <div 
                      key={activity.id} 
                      className={`group glass p-6 rounded-xl hover:-translate-y-1 transition-all duration-300 border border-white/5 ${colorClasses.border}`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses.bg} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {activity.icon}
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold mb-2 ${colorClasses.text}`}>
                            {activity.title}
                          </h3>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {history.length > 0 && (
            <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-8 bg-yellow-500 rounded-full mr-3" />
                동아리 연혁
              </h2>
              <div className="relative border-l-2 border-gray-700 ml-4 space-y-8 py-2">
                {history.map((item, index) => (
                  <div key={item.id} className="relative pl-8 group">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-800 border-2 border-cyan-500 group-hover:bg-cyan-500 group-hover:scale-125 transition-all duration-300" />
                    <div className="flex flex-col sm:flex-row sm:items-baseline mb-1">
                      <span className="text-cyan-400 font-bold text-lg mr-4 w-20">{item.year}</span>
                      <h4 className="text-white font-bold text-lg group-hover:text-cyan-300 transition-colors">{item.title}</h4>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {contacts.length > 0 && (
            <section className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-8 bg-purple-500 rounded-full mr-3" />
                Contact
              </h2>
              <div className="glass p-6 rounded-xl border border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="text-gray-400 font-medium min-w-[80px]">{contact.label}</span>
                      <span className="text-white font-semibold">{contact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
