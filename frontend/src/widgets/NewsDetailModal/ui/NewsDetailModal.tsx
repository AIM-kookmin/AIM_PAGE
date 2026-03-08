'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Calendar, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import gsap from 'gsap'
import type { News } from '@/entities/news/model/types'
import { useLenisControl } from '@/shared/hooks'

interface NewsDetailModalProps {
  news: News | null
  isOpen: boolean
  onClose: () => void
}

export default function NewsDetailModal({
  news,
  isOpen,
  onClose,
}: NewsDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useLenisControl(isOpen)

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      '공지': 'bg-red-500/10 border-red-500/20 text-red-400',
      '행사': 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      '성과': 'bg-green-500/10 border-green-500/20 text-green-400',
      '소식': 'bg-violet-500/10 border-violet-500/20 text-violet-400',
      '기타': 'bg-gray-500/10 border-gray-500/20 text-gray-400',
    }
    return colors[category] || colors['기타']
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  // Handle keyboard navigation for carousel
  useEffect(() => {
    if (!isOpen || !news) return

    const images = news.card_images || []

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
  }, [isOpen, news])

  // Entrance animation
  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current && contentRef.current) {
      setCurrentImageIndex(0)

      const ctx = gsap.context(() => {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        )

        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.95, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out', delay: 0.1 }
        )

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
  }, [isOpen, news])

  if (!isOpen || !news) return null

  const images = news.card_images || []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-modal-title"
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
          {/* Image Carousel Section */}
          <div className="relative w-full aspect-[16/9] bg-gray-800/50 overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                {/* Carousel Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:border-white/20 transition-all duration-300 group z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:border-white/20 transition-all duration-300 group z-10"
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
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentImageIndex
                              ? 'bg-violet-400 w-6'
                              : 'bg-white/30 hover:bg-white/50'
                          }`}
                          aria-label={`Go to image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : news.thumbnail_url ? (
              <>
                <img
                  src={news.thumbnail_url}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
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
            <div className="absolute top-4 left-4 z-10 flex gap-2 animate-reveal">
              <span className={`inline-flex px-3 py-1.5 rounded-full backdrop-blur-md border text-sm font-medium shadow-lg ${getCategoryColor(news.category)}`}>
                {news.category}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div ref={contentRef} className="p-8 space-y-6">
            {/* Title */}
            <div className="animate-reveal">
              <h2
                id="news-modal-title"
                className="text-3xl md:text-4xl font-bold text-white leading-tight"
              >
                {news.title}
              </h2>
            </div>

            {/* Metadata */}
            <div className="animate-reveal flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-violet-400" />
                <span>{formatDate(news.date)}</span>
              </div>
              {images.length > 0 && (
                <span className="text-sm text-gray-500">
                  {currentImageIndex + 1} / {images.length} 카드
                </span>
              )}
            </div>

            {/* Subtitle/Description */}
            {news.subtitle && (
              <div className="animate-reveal">
                <p className="text-base text-white/80 leading-relaxed whitespace-pre-wrap">
                  {news.subtitle}
                </p>
              </div>
            )}

            {/* External Link Button */}
            {news.link && (
              <div className="animate-reveal pt-4">
                <a
                  href={news.link}
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
