'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Calendar, Image as ImageIcon } from 'lucide-react'
import type { Activity } from '@/types/supabase'
import ActivityDetailModal from './components/ActivityDetailModal'

gsap.registerPlugin(ScrollTrigger)

interface ActivitiesClientProps {
  activities: Activity[]
}

export default function ActivitiesClient({ activities }: ActivitiesClientProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )

      if (gridRef.current) {
        gsap.fromTo(gridRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        )
      }
    }, mainRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={mainRef} className="min-h-screen bg-black overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            transform: 'translate(-20%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            transform: 'translate(20%, 30%)',
          }}
        />
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section ref={heroRef} className="min-h-[50vh] flex items-center justify-center pt-20 px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Activities
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              AIM의 다양한 활동과 이벤트를 확인해보세요
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 mx-auto mt-8 rounded-full" />
          </div>
        </section>

        {/* Activities Grid */}
        <section ref={gridRef} className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            {activities.length === 0 ? (
              <div className="text-center p-12 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-gray-500 text-lg">등록된 활동이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => {
                  return (
                    <button
                      key={activity.id}
                      onClick={() => setSelectedActivity(activity)}
                      className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden flex flex-col text-left cursor-pointer"
                    >
                      {/* Image */}
                      {activity.image_url ? (
                        <div className="relative w-full h-48 bg-white/[0.02] overflow-hidden">
                          <img
                            src={activity.image_url}
                            alt={activity.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full h-48 bg-white/[0.02] flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-700" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
                            {activity.category}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {formatDate(activity.date)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                          {activity.title}
                        </h3>

                        {activity.description && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">&copy; 2025 AIM (AI Monsters). All rights reserved.</p>
        </div>
      </footer>

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  )
}
