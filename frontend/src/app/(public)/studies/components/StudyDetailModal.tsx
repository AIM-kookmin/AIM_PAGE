'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Calendar, Users, BarChart3, CheckCircle2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import type { Study } from '@/types/database'
import { useLenisControl } from '@/shared/hooks'

interface StudyDetailModalProps {
  study: Study | null
  isOpen: boolean
  onClose: () => void
}

export default function StudyDetailModal({
  study,
  isOpen,
  onClose,
}: StudyDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useLenisControl(isOpen)

  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return null

    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }
    if (startDate) {
      return `${formatDate(startDate)} -`
    }
    return formatDate(endDate!)
  }

  const getStatusBadge = (status: Study['status']) => {
    const badges = {
      recruiting: { text: '모집중', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
      active: { text: '진행중', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
      completed: { text: '완료', color: 'bg-gray-500/10 border-gray-500/20 text-gray-400' },
      cancelled: { text: '취소', color: 'bg-red-500/10 border-red-500/20 text-red-400' },
    }
    return badges[status]
  }

  const getDifficultyBadge = (level: Study['level']) => {
    const badges = {
      '입문': { text: '입문', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
      '중급': { text: '중급', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
      '심화': { text: '심화', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
      '응용': { text: '응용', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
    }
    return badges[level]
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

  // Handle keyboard navigation for carousel
  useEffect(() => {
    if (!isOpen || !study) return

    const images = study.images && study.images.length > 0 ? study.images : [study.cover_url].filter((url): url is string => Boolean(url))

    const handleArrowKeys = (e: KeyboardEvent) => {
      if (images.length <= 1) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
      }
    }

    window.addEventListener('keydown', handleArrowKeys)
    return () => window.removeEventListener('keydown', handleArrowKeys)
  }, [isOpen, study])

  // Entrance animation
  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current && contentRef.current) {
      // Reset image index when modal opens
      setCurrentImageIndex(0)

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
  }, [isOpen, study])

  if (!isOpen || !study) return null

  const images = study.images && study.images.length > 0 ? study.images : [study.cover_url].filter((url): url is string => Boolean(url))
  const statusBadge = getStatusBadge(study.status)
  const difficultyBadge = getDifficultyBadge(study.level)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white hover:bg-black/70 hover:border-white/20 hover:rotate-90 transition-all duration-300 group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Scrollable Content */}
        <div data-lenis-prevent className="overflow-y-auto custom-scrollbar">
          {/* Image Carousel Section */}
          <div className="relative w-full aspect-[16/9] bg-gray-800/50 overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={study.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                {/* Carousel Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:border-white/20 transition-all duration-300 group z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:border-white/20 transition-all duration-300 group z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === currentImageIndex
                              ? 'bg-violet-400 w-6'
                              : 'bg-white/30 hover:bg-white/50 w-2'
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
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

            {/* Status & Difficulty Badges - Overlaid on image */}
            <div className="absolute top-4 left-4 z-10 flex gap-2 animate-reveal">
              <span className={`inline-flex px-3 py-1.5 rounded-full backdrop-blur-md border text-sm font-medium shadow-lg ${statusBadge.color}`}>
                {statusBadge.text}
              </span>
              <span className={`inline-flex px-3 py-1.5 rounded-full backdrop-blur-md border text-sm font-medium shadow-lg ${difficultyBadge.color}`}>
                {difficultyBadge.text}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div ref={contentRef} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Title */}
            <div className="animate-reveal">
              <h2
                id="modal-title"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight"
              >
                {study.title}
              </h2>
            </div>

            {/* Metadata Grid */}
            <div className="animate-reveal grid grid-cols-1 gap-3 sm:gap-4">
              {/* Period */}
              {formatDateRange(study.start_date, study.end_date) && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Calendar className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">기간</p>
                    <p className="text-sm font-medium text-white">
                      {formatDateRange(study.start_date, study.end_date)}
                    </p>
                  </div>
                </div>
              )}

              {/* Difficulty */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">난이도</p>
                  <p className="text-sm font-medium text-white">
                    {difficultyBadge.text}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <CheckCircle2 className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">상태</p>
                  <p className="text-sm font-medium text-white">
                    {statusBadge.text}
                  </p>
                </div>
              </div>

              {/* Participants */}
              {study.participants && study.participants.length > 0 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <Users className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">참여자</p>
                    <p className="text-sm font-medium text-white truncate" title={study.participants.join(', ')}>
                      {study.participants.length}명
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Participants List */}
            {study.participants && study.participants.length > 0 && (
              <div className="animate-reveal">
                <h3 className="text-sm font-semibold text-white/80 mb-3">참여 멤버</h3>
                <div className="flex flex-wrap gap-2">
                  {study.participants.map((participant, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-sm text-white/90 hover:bg-white/[0.08] hover:border-violet-500/30 transition-all duration-200"
                    >
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description/Content */}
            {(study.description || study.content) && (
              <div className="animate-reveal">
                <h3 className="text-sm font-semibold text-white/80 mb-3">소개</h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-base text-white/80 leading-relaxed whitespace-pre-line">
                    {study.description || study.content}
                  </p>
                </div>
              </div>
            )}

            {/* External Link Button */}
            {study.link && (
              <div className="animate-reveal pt-4">
                <a
                  href={study.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium hover:from-violet-500 hover:to-violet-400 hover:shadow-lg hover:shadow-violet-500/30 transition-all duration-300 group"
                >
                  <span>외부 링크 열기</span>
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
