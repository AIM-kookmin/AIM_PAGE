'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Study } from '@/types/database'

interface StudyPreviewProps {
  formData: {
    title: string
    start_date: string
    end_date: string
    content: string
    link: string
    participants: string[]
    status: Study['status']
    visibility: Study['visibility']
  }
  images: Array<{ id: string; preview: string }>
}

export default function StudyPreview({ formData, images }: StudyPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Reset index if it's out of bounds
  useEffect(() => {
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(Math.max(0, images.length - 1))
    } else if (images.length === 0) {
      setCurrentImageIndex(0)
    }
  }, [images.length, currentImageIndex])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="sticky top-24 space-y-4">
      <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <h3 className="text-sm font-medium text-gray-400">실시간 미리보기</h3>
        </div>

        {/* Preview Card */}
        <div className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden">
          {/* Image Gallery */}
          {images.length > 0 && images[currentImageIndex] ? (
            <div className="relative aspect-video bg-black">
              <img
                src={images[currentImageIndex].preview}
                alt={`Preview ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all duration-200"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
                    <span className="text-xs font-medium text-white">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                  </div>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <div className={`px-2.5 py-1 rounded-lg backdrop-blur-sm text-xs font-medium ${
                  formData.status === 'active'
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : formData.status === 'completed'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : formData.status === 'recruiting'
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                    : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                }`}>
                  {formData.status === 'active' && '진행중'}
                  {formData.status === 'completed' && '완료'}
                  {formData.status === 'recruiting' && '모집중'}
                  {formData.status === 'cancelled' && '취소됨'}
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-white/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">이미지를 업로드하세요</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <h3 className="text-xl font-bold text-white">
              {formData.title || '제목을 입력하세요'}
            </h3>

            {/* Period */}
            {(formData.start_date || formData.end_date) && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {formData.start_date ? formatDate(formData.start_date) : '시작일'} ~{' '}
                  {formData.end_date ? formatDate(formData.end_date) : '종료일'}
                </span>
              </div>
            )}

            {/* Content */}
            {formData.content && (
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {formData.content}
              </p>
            )}

            {/* Participants */}
            {formData.participants.length > 0 && (
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">
                    참여 멤버 ({formData.participants.length}명)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300"
                    >
                      {participant}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Link */}
            {formData.link && (
              <div className="pt-3 border-t border-white/10">
                <a
                  href={formData.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-300 hover:text-violet-200 transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">자세히 보기</span>
                </a>
              </div>
            )}

            {/* Visibility Info */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs text-gray-500">
                공개 범위:{' '}
                <span className="text-gray-400">
                  {formData.visibility === 'public' && '전체 공개'}
                  {formData.visibility === 'private' && '비공개'}
                  {formData.visibility === 'members_only' && '멤버만 공개'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          사용자에게 이렇게 표시됩니다
        </p>
      </div>
    </div>
  )
}
