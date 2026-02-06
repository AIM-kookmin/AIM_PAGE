'use client'

import { useEffect, useRef } from 'react'
import { X, Calendar, Users, MapPin, User, ExternalLink } from 'lucide-react'
import gsap from 'gsap'
import type { Activity } from '@/types/supabase'
import { useLenisControl } from '@/shared/hooks'

interface ActivityDetailModalProps {
  activity: Activity | null
  isOpen: boolean
  onClose: () => void
}

export default function ActivityDetailModal({
  activity,
  isOpen,
  onClose,
}: ActivityDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLenisControl(isOpen)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      return () => window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Entrance animation
  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current && contentRef.current) {
      const ctx = gsap.context(() => {
        // Overlay fade in
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        )

        // Modal scale + fade
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.1 }
        )

        // Staggered content reveal
        const elements = contentRef.current?.querySelectorAll('.animate-reveal')
        if (elements) {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: 'power2.out',
              delay: 0.3,
            }
          )
        }
      })

      return () => ctx.revert()
    }
  }, [isOpen, activity])

  if (!isOpen || !activity) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 hover:border-white/20 hover:rotate-90 transition-all duration-300 group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Scrollable Content */}
        <div data-lenis-prevent className="overflow-y-auto custom-scrollbar">
          {/* Hero Image Section */}
          <div className="relative w-full aspect-[16/9] bg-gray-800/50 overflow-hidden">
            {activity.image_url ? (
              <>
                <img
                  src={activity.image_url}
                  alt={activity.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/20 to-indigo-900/20">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-violet-400/50" />
                  </div>
                  <p className="text-gray-500 text-sm">이미지 없음</p>
                </div>
              </div>
            )}

            {/* Category Badge - Overlaid on image */}
            <div className="absolute top-4 left-4 z-10 animate-reveal">
              <span className="inline-flex px-4 py-2 rounded-full bg-violet-500/20 backdrop-blur-md border border-violet-500/30 text-violet-300 text-sm font-medium shadow-lg shadow-violet-500/10">
                {activity.category}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div ref={contentRef} className="p-8 space-y-6">
            {/* Title */}
            <div className="animate-reveal">
              <h2
                id="modal-title"
                className="text-3xl md:text-4xl font-bold text-white leading-tight"
              >
                {activity.title}
              </h2>
            </div>

            {/* Date */}
            <div className="animate-reveal flex items-center gap-2 text-gray-400">
              <Calendar className="w-5 h-5 text-violet-400" />
              <time dateTime={activity.date} className="text-base">
                {formatDate(activity.date)}
              </time>
            </div>

            {/* Metadata Grid */}
            {(activity.participants || activity.location || activity.organizer) && (
              <div className="animate-reveal grid grid-cols-1 sm:grid-cols-3 gap-4">
                {activity.participants && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <Users className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">참가자</p>
                      <p className="text-sm font-medium text-white truncate">
                        {activity.participants}명
                      </p>
                    </div>
                  </div>
                )}

                {activity.location && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <MapPin className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">장소</p>
                      <p className="text-sm font-medium text-white truncate" title={activity.location}>
                        {activity.location}
                      </p>
                    </div>
                  </div>
                )}

                {activity.organizer && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <User className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">주최자</p>
                      <p className="text-sm font-medium text-white truncate" title={activity.organizer}>
                        {activity.organizer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {activity.description && (
              <div className="animate-reveal">
                <p className="text-base text-white/80 leading-relaxed whitespace-pre-wrap">
                  {activity.description}
                </p>
              </div>
            )}

            {/* External Link Button */}
            {activity.link && (
              <div className="animate-reveal pt-4">
                <a
                  href={activity.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium hover:from-violet-500 hover:to-violet-400 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 group"
                >
                  <span>자세히 보기</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  )
}
