'use client'

import { Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react'
import type { Activity } from '@/types/supabase'

interface ActivityPreviewProps {
  formData: {
    title: string
    category: Activity['category']
    date: string
    description: string
    image_url: string
    link: string
    location: string
    participants: string
    organizer: string
    is_active: boolean
  }
  imagePreview: string | null
}

const CATEGORY_LABELS: Record<Activity['category'], string> = {
  competition: '대회',
  seminar: '세미나',
  workshop: '워크샵',
  project: '프로젝트',
  social: '친목',
  etc: '기타'
}

export default function ActivityPreview({ formData, imagePreview }: ActivityPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '날짜 미정'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="sticky top-8">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Live Preview
        </h3>
        <p className="text-xs text-gray-500">
          사용자에게 표시되는 모습
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 transition-all duration-300 overflow-hidden">
        {/* Image */}
        {imagePreview || formData.image_url ? (
          <div className="relative w-full h-48 bg-white/[0.02] overflow-hidden">
            <img
              src={imagePreview || formData.image_url}
              alt={formData.title || 'Preview'}
              className="w-full h-full object-cover"
            />
            {formData.link && (
              <div className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-48 bg-white/[0.02] flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-700" />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium">
              {CATEGORY_LABELS[formData.category]}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {formatDate(formData.date)}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 min-h-[3.5rem]">
            {formData.title || '제목을 입력하세요'}
          </h3>

          {formData.description && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 min-h-[3.75rem]">
              {formData.description}
            </p>
          )}

          {!formData.is_active && (
            <div className="mt-4 px-3 py-1.5 rounded-lg bg-gray-500/20 border border-gray-500/30 text-gray-400 text-xs font-medium inline-block">
              비공개 상태 (사용자에게 표시되지 않음)
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {(formData.location || formData.participants || formData.organizer) && (
        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            추가 정보
          </h4>
          <div className="space-y-2 text-sm">
            {formData.location && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">장소:</span>
                <span className="text-white">{formData.location}</span>
              </div>
            )}
            {formData.participants && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">참가자:</span>
                <span className="text-white">{formData.participants}명</span>
              </div>
            )}
            {formData.organizer && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">주최:</span>
                <span className="text-white">{formData.organizer}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
